import { Exclude } from "class-transformer";
import { Provider } from "src/common/provider.enum";
import { Meme } from "src/meme/meme.entity";
import { Vote } from "src/vote/vote.entity";
import { Comment } from "src/comment/comment.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  username: string;

  @Column({ unique: true })
  email: string;

  @Column()
  @Exclude()
  password: string;

  @Column({ type: 'date', nullable: true })
  birthDate: Date;


  @Column({ type: 'enum', enum: Provider, nullable: true })
  provider: Provider;

  @OneToMany(() => Meme, (meme) => meme.author)
  memes: Meme[];

  @OneToMany(() => Vote, (vote) => vote.user)
  votes: Vote[];

  @OneToMany(() => Comment, (comment) => comment.author)
  comments: Comment[];
}
