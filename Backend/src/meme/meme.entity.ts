import { Tag } from 'src/tag/tag.entity';
import { Vote } from 'src/vote/vote.entity';
import { Comment } from 'src/comment/comment.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
  ManyToOne,
} from 'typeorm';
import { User } from 'src/user/user.entity';


@Entity()
export class Meme {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  imageUrl: string; 

  @CreateDateColumn()
  createdAt: Date;

  @Column({ default: 0 })
  upvoteCount: number;
  
  @Column({ default: 0 })
  downvoteCount: number;

  @ManyToOne(() => User, (user) => user.memes, { onDelete: 'CASCADE' })
  author: User;

  @OneToMany(() => Vote, (vote) => vote.meme)
  votes: Vote[];
  
  @OneToMany(() => Comment, (comment) => comment.meme)
  comments: Comment[];

  @ManyToMany(() => Tag, (tag) => tag.memes, { cascade: true })
  @JoinTable()
  tags: Tag[];
}