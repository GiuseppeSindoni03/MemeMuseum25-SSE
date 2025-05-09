// dto/user-preview.dto.ts
import { Expose } from 'class-transformer';

export class UserPreviewDto {
  @Expose()
  username: string;
}
