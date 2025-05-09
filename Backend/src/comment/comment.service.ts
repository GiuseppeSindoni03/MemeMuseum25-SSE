import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/user/user.entity';
import { Meme } from 'src/meme/meme.entity';
import { Comment } from 'src/comment/comment.entity';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,

    @InjectRepository(Meme)
    private readonly memeRepository: Repository<Meme>,
  ) {}

  async create(user: User, memeId:string, dto: CreateCommentDto): Promise<Comment> {
    const meme = await this.memeRepository.findOne({
      where: { id: memeId },
    });

    if (!meme) {
      throw new NotFoundException('Meme not found');
    }

    const comment = this.commentRepository.create({
      text: dto.text,
      author: user,
      meme: meme,
    });

    return this.commentRepository.save(comment);
  }

  async delete(commentId: string, userId: string): Promise<void> {
    const comment = await this.commentRepository.findOneBy({id: commentId});
    if(comment?.author.id!= userId)
      throw new ForbiddenException('You are not allowed to delete this comment');

    const result = await this.commentRepository.delete(commentId);
    if (result.affected === 0) {
      throw new NotFoundException(`Comment id "${commentId}" not found`);
    }
  }

  async getById(commentId: string): Promise<Comment> {
    const comment = await this.commentRepository.findOne({
      where: { id: commentId },
      relations: ['author', 'meme'],
    });

    if (!comment) {
      throw new NotFoundException(`Comment id "${commentId}" not found`);    }

    return comment;
  }
}
