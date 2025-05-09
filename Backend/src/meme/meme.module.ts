import { Module } from '@nestjs/common';
import { MemeService } from './meme.service';
import { MemeController } from './meme.controller';
import { Meme } from './meme.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentModule } from 'src/comment/comment.module';
import { Tag } from 'src/tag/tag.entity';
import { TagModule } from 'src/tag/tag.module';
import { VoteModule } from 'src/vote/vote.module';
import { Vote } from 'src/vote/vote.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Meme,Tag,Vote]), CommentModule,TagModule,VoteModule],
  controllers: [MemeController],
  providers: [MemeService],
})
export class MemeModule {}
