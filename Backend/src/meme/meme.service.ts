import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateMemeDto } from './dto/create-meme.dto';
import { UpdateMemeDto } from './dto/update-meme.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Meme } from './meme.entity';
import { User } from 'src/user/user.entity';
import * as path from 'path';
import * as fs from 'fs';
import { Tag } from 'src/tag/tag.entity';
import { TagService } from 'src/tag/tag.service';
import { Comment } from 'src/comment/comment.entity';
import { Vote, VoteType } from 'src/vote/vote.entity';

@Injectable()
export class MemeService {
  constructor(
    @InjectRepository(Meme)
    private memeRepository: Repository<Meme>,

    @InjectRepository(Vote)
    private voteRepository: Repository<Vote>,

    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,

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

  async getAll(userId?: string): Promise<any[]> {
    const memes = await this.memeRepository.find({
      relations: ['author', 'tags', 'comments', 'votes'],
      order: { createdAt: 'DESC' },
    });

    const formattedMemes = await Promise.all(
      memes.map(async (meme) => {
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
      }),
    );

    return formattedMemes;
  }

  async getById(memeId: string, userId?: string): Promise<any> {
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

    if (!meme) throw new NotFoundException(`Meme id  "${memeId}" not found`);

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

  async countVotes(memeId: string): Promise<{ up: number; down: number }> {
    const [up, down] = await Promise.all([
      this.voteRepository.count({
        where: {
          meme: { id: memeId },
          type: VoteType.UP,
        },
      }),
      this.voteRepository.count({
        where: {
          meme: { id: memeId },
          type: VoteType.DOWN,
        },
      }),
    ]);

    return { up, down };
  }

  async getComments(memeId: string): Promise<Comment[]> {
    const found = await this.memeRepository.findOneBy({ id: memeId });

    if (!found) throw new NotFoundException(`Meme id  "${memeId}" not found`);

    return this.commentRepository.find({
      where: {
        meme: { id: memeId },
      },
      relations: ['author'], // include info sull'autore del commento
      order: {
        createdAt: 'DESC',
      },
    });
  }

  update(id: number, updateMemeDto: UpdateMemeDto) {
    return `This action updates a #${id} meme`;
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
      __dirname,
      '..',
      '..',
      'uploads',
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
}
