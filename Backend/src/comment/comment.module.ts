import { Module } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from './comment.entity';
import { Meme } from 'src/meme/meme.entity';
import { User } from 'src/user/user.entity';


@Module({
  imports: [TypeOrmModule.forFeature([Comment,Meme,User])],
  controllers: [CommentController],
  providers: [CommentService],
  exports: [TypeOrmModule],
})
export class CommentModule {}
