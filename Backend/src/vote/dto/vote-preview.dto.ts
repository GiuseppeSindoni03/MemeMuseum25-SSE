import { Expose } from "class-transformer";
import { VoteType } from "src/vote/vote.entity";

export class VotePreviewDto {
  @Expose()
  id: string;

  @Expose()
  type: VoteType;
}