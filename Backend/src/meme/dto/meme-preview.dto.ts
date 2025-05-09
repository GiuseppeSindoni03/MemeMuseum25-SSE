// dto/meme-response.dto.ts
import { Expose, Type } from 'class-transformer';
import { CommentPreviewDto } from 'src/comment/dto/comment-preview.dto';
import { TagPreviewDto } from 'src/tag/dto/tag-preview.dto';
import { UserPreviewDto } from 'src/user/dto/user-preview.dto';
import { VotePreviewDto } from 'src/vote/dto/vote-preview.dto';

export class MemePreviewDto {
  @Expose()
  id: string;

  @Expose()
  title: string;

  @Expose()
  imageUrl: string;

  @Expose()
  @Type(() => UserPreviewDto)
  author: UserPreviewDto;

  @Expose()
  @Type(() => VotePreviewDto)
  votes: VotePreviewDto;

  @Expose()
  @Type(() => CommentPreviewDto)
  comments: CommentPreviewDto[];

  @Expose()
  @Type(() => TagPreviewDto)
  tags: TagPreviewDto[];
}
