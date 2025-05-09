import { Expose } from "class-transformer";

export class TagPreviewDto {
  @Expose()
  name: string;
}