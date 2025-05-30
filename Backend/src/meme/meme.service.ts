import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateMemeDto } from './dto/create-meme.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Meme } from './meme.entity';
import { User } from 'src/user/user.entity';
import * as path from 'path';
import * as fs from 'fs';
import { TagService } from 'src/tag/tag.service';
import { Comment } from 'src/comment/comment.entity';
import { Vote, VoteType } from 'src/vote/vote.entity';
import { SearchDto } from './dto/search.dto';
import { MemeResponseDto } from './dto/meme-response.dto';

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
    });

    const newMeme = await this.memeRepository.save(meme);

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

  async getById(memeId: string, userId?: string): Promise<MemeResponseDto> {
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
    return formatted;
  }

    async getMyMemes( userId: string): Promise<MemeResponseDto[]> {
    const memes = await this.memeRepository.find({
      where: {
        author: { id: userId },
      },
      relations: [
        'author',
        'tags',
        'comments',
        'comments.author',
        'votes',
        'votes.user',
      ],
    });

    const formatted = await this.formatMemes(memes, userId);
    return formatted;
  }

  async search(
    searchDto: SearchDto,
    userId?: string,
  ): Promise<MemeResponseDto[]> {
    const { title, date, tags } = searchDto;

    const query = this.memeRepository
      .createQueryBuilder('meme')
      .leftJoinAndSelect('meme.author', 'author')
      .leftJoinAndSelect('meme.tags', 'tags')
      .leftJoinAndSelect('meme.comments', 'comments')
      .leftJoinAndSelect('meme.votes', 'votes')
      .orderBy('meme.createdAt', 'DESC');

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

    const memes = await query.getMany();
    const formattedMemes = this.formatMemes(memes, userId);
    return formattedMemes;
  }

  async getMyUpvotedMemes(userId: string): Promise<MemeResponseDto[]> {
    const votes: Vote[] = await this.voteRepository.find({
      where: {
        user: { id: userId },
        type: VoteType.UP,
      },
      relations: [
        'meme',
        'meme.author',
        'meme.tags',
        'meme.votes',
        'meme.comments',
      ],
    });

    const upvotedMemes = votes.map((vote) => vote.meme);

    return await this.formatMemes(upvotedMemes, userId);
  }
  async getTodayMeme(): Promise<MemeResponseDto[]> {
    const allValidMemes = await this.getAll();

    const dayOfYear = Math.floor(
      (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) /
        (1000 * 60 * 60 * 24),
    );

    const memesPerDay = 10;
    const startIndex = dayOfYear % allValidMemes.length;

    // Costruisci il blocco ciclico di 10 meme a partire da startIndex
    const dailyMemes: MemeResponseDto[] = [];
    for (let i = 0; i < memesPerDay && i < allValidMemes.length; i++) {
      const index = (startIndex + i) % allValidMemes.length;
      dailyMemes.push(allValidMemes[index]);
    }

    return dailyMemes;
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
      '/home/dietideals/Scrivania/UploadsMemeMuseum',
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
    const upvotes = meme.votes.filter((v) => v.type === 'UP').length;
    const downvotes = meme.votes.filter((v) => v.type === 'DOWN').length;

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
      upvote: upvotes,
      downvote: downvotes,
      userVote: userVoteType,
      tags: meme.tags.map((tag) => tag.name),
      commentsCount: meme.comments.length,
    };
  }
}
