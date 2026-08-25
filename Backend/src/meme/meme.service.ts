import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateMemeDto } from './dto/create-meme.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Meme } from './meme.entity';
import { User } from 'src/user/user.entity';
import * as path from 'path';
import * as fs from 'fs';
import { TagService } from 'src/tag/tag.service';
import { Vote, VoteType } from 'src/vote/vote.entity';
import { SearchDto } from './dto/search.dto';
import { MemeResponseDto } from './dto/meme-response.dto';
import { memoryCache } from 'src/common/memory-cache';

@Injectable()
export class MemeService {
  constructor(
    @InjectRepository(Meme)
    private memeRepository: Repository<Meme>,

    @InjectRepository(Vote)
    private voteRepository: Repository<Vote>,

    private tagService: TagService,
  ) {}

  async createMeme(
    user: User,
    dto: CreateMemeDto,
    filename: string,
  ): Promise<any> {
    const tags = await this.tagService.findOrCreateTags(dto.tags);

    const meme = this.memeRepository.create({
      title: dto.title,
      imageUrl: `/uploads/${filename}`,
      tags: tags,
      author: { id: user.id },
      upvoteCount: 0,
      downvoteCount: 0,
    });

    const newMeme = await this.memeRepository.save(meme);
    memoryCache.clear();

    return {
      id: newMeme.id,
      title: newMeme.title,
      imageUrl: newMeme.imageUrl,
      createdAt: newMeme.createdAt,
      author: user.username,
      upvote: 0,
      downvote: 0,
      userVote: null,
      tags: newMeme.tags.map((tag) => tag.name),
      commentsCount: 0,
    };
  }

  async getAll(userId?: string): Promise<MemeResponseDto[]> {
    const memes = await this.memeRepository.find({
      relations: ['author', 'tags', 'comments', 'votes'],
      order: { createdAt: 'DESC' },
    });

    const formatted = await this.formatMemes(memes, userId);
    return formatted;
  }

  async getAllPaginated(
    userId?: string,
    limit = 10,
    offset = 0,
  ): Promise<{ memes: MemeResponseDto[]; total: number }> {
    const cacheKey = `feed_${userId || 'anon'}_${limit}_${offset}`;
    const cached = memoryCache.get<{ memes: MemeResponseDto[]; total: number }>(cacheKey);
    if (cached) {
      return cached;
    }

    const [memes, total] = await this.memeRepository.findAndCount({
      relations: ['author', 'tags', 'comments', 'votes'],
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });

    const formatted = await this.formatMemes(memes, userId);
    const result = { memes: formatted, total };

    if (!userId) {
      memoryCache.set(cacheKey, result, 30); // 30s cache for public feed
    }

    return result;
  }

  async getById(memeId: string, userId?: string): Promise<MemeResponseDto> {
    const cacheKey = `meme_detail_${memeId}_${userId || 'anon'}`;
    const cached = memoryCache.get<MemeResponseDto>(cacheKey);
    if (cached) {
      return cached;
    }

    const meme = await this.memeRepository.findOne({
      where: { id: memeId },
      relations: [
        'author',
        'tags',
        'comments',
        'comments.author',
        'votes',
        'votes.user',
      ],
    });

    if (!meme) throw new NotFoundException();

    const formatted = await this.formatSingleMeme(meme, userId);
    if (!userId) {
      memoryCache.set(cacheKey, formatted, 60);
    }
    return formatted;
  }

  async getMyMemes(
    userId: string,
    limit = 10,
    offset = 0,
  ): Promise<{ memes: MemeResponseDto[]; total: number }> {
    const [memes, total] = await this.memeRepository.findAndCount({
      where: { author: { id: userId } },
      relations: [
        'author',
        'tags',
        'comments',
        'comments.author',
        'votes',
        'votes.user',
      ],
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });

    const formatted = await this.formatMemes(memes, userId);
    return { memes: formatted, total };
  }

  async search(
    searchDto: SearchDto,
    userId?: string,
    limit = 10,
    offset = 0,
  ): Promise<{ memes: MemeResponseDto[]; total: number }> {
    const cacheKey = `search_${JSON.stringify(searchDto)}_${userId || 'anon'}_${limit}_${offset}`;
    const cached = memoryCache.get<{ memes: MemeResponseDto[]; total: number }>(cacheKey);
    if (cached) {
      return cached;
    }

    const { title, date, tags, sortBy } = searchDto;

    const query = this.memeRepository
      .createQueryBuilder('meme')
      .leftJoinAndSelect('meme.author', 'author')
      .leftJoinAndSelect('meme.tags', 'tags')
      .leftJoinAndSelect('meme.comments', 'comments')
      .leftJoinAndSelect('meme.votes', 'votes');

    // Filtri
    if (title) {
      query.andWhere('LOWER(meme.title) LIKE LOWER(:title)', {
        title: `%${title}%`,
      });
    }

    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);

      query.andWhere('meme.createdAt BETWEEN :start AND :end', {
        start,
        end,
      });
    }

    if (tags && tags.length > 0) {
      query.andWhere('tags.name IN (:...tags)', { tags });
    }

    if (sortBy === 'upvote') {
      query.orderBy('meme.upvoteCount', 'DESC');
    } else if (sortBy === 'downvote') {
      query.orderBy('meme.downvoteCount', 'DESC');
    } else {
      query.orderBy('meme.createdAt', 'DESC');
    }

    const [memes, total] = await query
      .skip(offset)
      .take(limit)
      .getManyAndCount();

    const formatted = await this.formatMemes(memes, userId);
    const result = { memes: formatted, total };

    if (!userId) {
      memoryCache.set(cacheKey, result, 30);
    }
    return result;
  }

  async getMyUpvotedMemesPaginated(
    userId: string,
    limit = 10,
    offset = 0,
  ): Promise<{ memes: MemeResponseDto[]; total: number }> {
    // Step 1: trova tutti i memeId upvotati
    const votes = await this.voteRepository.find({
      where: {
        user: { id: userId },
        type: VoteType.UP,
      },
      relations: ['meme'],
    });

    const memeIds = votes.map((v) => v.meme.id);

    if (memeIds.length === 0) {
      return { memes: [], total: 0 };
    }

    // Step 2: paginazione solo su quelli
    const [memes, total] = await this.memeRepository.findAndCount({
      where: { id: In(memeIds) },
      relations: ['author', 'tags', 'comments', 'votes'],
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });

    const formatted = await this.formatMemes(memes, userId);
    return { memes: formatted, total };
  }

  async getTodayMeme(): Promise<MemeResponseDto[]> {
    const dayOfYear = Math.floor(
      (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) /
        (1000 * 60 * 60 * 24),
    );

    const cacheKey = `today_meme_${dayOfYear}`;
    const cached = memoryCache.get<MemeResponseDto[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const totalMemes = await this.memeRepository.count();
    if (totalMemes === 0) return [];

    const memesPerDay = Math.min(5, totalMemes);
    const startIndex = dayOfYear % totalMemes;

    // Fetch exactly the required elements (avoids memory bloat)
    let memes = await this.memeRepository.find({
      relations: ['author', 'tags', 'comments', 'votes'],
      order: { createdAt: 'DESC' },
      skip: startIndex,
      take: memesPerDay,
    });

    // Handle wrap-around if we reach the end of the records
    if (memes.length < memesPerDay) {
      const remaining = memesPerDay - memes.length;
      const wrapAroundMemes = await this.memeRepository.find({
        relations: ['author', 'tags', 'comments', 'votes'],
        order: { createdAt: 'DESC' },
        skip: 0,
        take: remaining,
      });
      memes = [...memes, ...wrapAroundMemes];
    }

    const result = await this.formatMemes(memes);
    // Cache for 24 hours (86400s)
    memoryCache.set(cacheKey, result, 86400);
    return result;
  }

  async delete(userId: string, id: string): Promise<void> {
    const meme = await this.memeRepository.findOne({
      where: { id },
      relations: ['author'],
    });

    if (!meme) {
      throw new NotFoundException('Meme not found');
    }

    if (meme.author.id !== userId) {
      throw new ForbiddenException('You are not allowed to delete this meme');
    }

    const filePath = path.join(
      process.cwd(), 'uploads',
      path.basename(meme.imageUrl),
    );

    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (err) {
      console.error('Errore durante la cancellazione del file:', err);
    }

    await this.memeRepository.delete({
      id: id,
      author: { id: userId } as User,
    });

    memoryCache.clear();
  }

  async formatMemes(
    memes: Meme[],
    userId?: string,
  ): Promise<MemeResponseDto[]> {
    return await Promise.all(
      memes.map((meme) => this.formatSingleMeme(meme, userId)),
    );
  }

  async formatSingleMeme(
    meme: Meme,
    userId?: string,
  ): Promise<MemeResponseDto> {
    let userVoteType: 'UP' | 'DOWN' | null = null;

    if (userId) {
      const userVote = await this.voteRepository.findOne({
        where: {
          meme: { id: meme.id },
          user: { id: userId },
        },
        select: ['id', 'type'],
      });

      userVoteType = userVote?.type ?? null;
    }

    return {
      id: meme.id,
      title: meme.title,
      imageUrl: meme.imageUrl,
      createdAt: meme.createdAt,
      author: meme.author.username,
      upvote: meme.upvoteCount,
      downvote: meme.downvoteCount,
      userVote: userVoteType,
      tags: meme.tags.map((tag) => tag.name),
      commentsCount: meme.comments.length,
    };
  }
}
