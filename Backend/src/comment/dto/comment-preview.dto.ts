// dto/comment-response.dto.ts
import { Expose, Type } from 'class-transformer';
import { UserPreviewDto } from 'src/user/dto/user-preview.dto';

export class CommentPreviewDto {
  @Expose()
  text: string;

  @Expose()
  @Type(() => UserPreviewDto)
  author: UserPreviewDto;

  @Expose()
  createdAt: Date;
}
