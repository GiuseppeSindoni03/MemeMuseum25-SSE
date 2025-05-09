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

    @InjectRepository(Tag)
    private tagService: TagService,
  ) {}

  async createMeme(
    userId: string,
    dto: CreateMemeDto,
    filename: string,
  ): Promise<Meme> {
    const tags = await this.tagService.findOrCreateTags(dto.tags);

    const meme = this.memeRepository.create({
      title: dto.title,
      imageUrl: `/uploads/${filename}`,
      tags: tags,
      author: { id: userId },
    });

    return this.memeRepository.save(meme);
  }

  async getAll(): Promise<Meme[]> {
    return this.memeRepository.find({
      relations: ['author', 'tags', 'comments', 'votes'],
      order: { createdAt: 'DESC' },
    });
  }

  async getById(memeId: string): Promise<Meme> {
    const found = await this.memeRepository.findOne({
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

    if (!found) throw new NotFoundException(`Meme id  "${memeId}" not found`);

    return found;
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
