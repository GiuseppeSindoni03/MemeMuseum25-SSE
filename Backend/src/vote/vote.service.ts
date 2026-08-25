import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Vote, VoteType } from './vote.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Meme } from 'src/meme/meme.entity';
import { User } from 'src/user/user.entity';
import { memoryCache } from 'src/common/memory-cache';

@Injectable()
export class VoteService {
  constructor(
    @InjectRepository(Vote)
    private voteRepository: Repository<Vote>,

    @InjectRepository(Meme)
    private memeRepository: Repository<Meme>,
  ) {}

  async createOrUpdateVote(memeId: string, userId: string, type: VoteType) {
    let vote = await this.getUserVote(memeId, userId);
    const meme = await this.memeRepository.findOneOrFail({ where: { id: memeId } });
  
    if (vote) {
      if (vote.type === type) {
        // Se il voto esiste ed è uguale, lo elimino
        await this.voteRepository.delete(vote.id);
  
        if (type === VoteType.UP) {
          meme.upvoteCount = Math.max(0, meme.upvoteCount - 1);
        } else {
          meme.downvoteCount = Math.max(0, meme.downvoteCount - 1);
        }
  
        await this.memeRepository.save(meme);
        return null;
      } else {
        // Se il voto esiste ma è diverso, lo aggiorno
        if (vote.type === VoteType.UP) {
          meme.upvoteCount = Math.max(0, meme.upvoteCount - 1);
          meme.downvoteCount += 1;
        } else {
          meme.downvoteCount = Math.max(0, meme.downvoteCount - 1);
          meme.upvoteCount += 1;
        }
  
        vote.type = type;
        await this.voteRepository.save(vote);
        await this.memeRepository.save(meme);
        return vote;
      }
    } else {
      // Crea nuovo voto
      vote = this.voteRepository.create({
        type,
        meme: { id: memeId } as Meme,
        user: { id: userId } as User,
      });
  
      if (type === VoteType.UP) {
        meme.upvoteCount += 1;
      } else {
        meme.downvoteCount += 1;
      }
  
      await this.voteRepository.save(vote);
      await this.memeRepository.save(meme);
      memoryCache.clear();
      return vote;
    }
  }
  

  async getUserVote(memeId: string, userId: string): Promise<Vote | null> {
    return this.voteRepository.findOne({
      where: {
        meme: { id: memeId },
        user: { id: userId },
      },
    });
  }

  async delete(voteId: string, userId: string): Promise<void> {
    if (!voteId) {
      throw new NotFoundException('Meme not found');
    }

    await this.voteRepository.delete({
      id: voteId,
      user: { id: userId } as User,
    });
    memoryCache.clear();
  }
}
