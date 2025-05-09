import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Vote, VoteType } from './vote.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Meme } from 'src/meme/meme.entity';
import { User } from 'src/user/user.entity';

@Injectable()
export class VoteService {
  constructor(
    @InjectRepository(Vote)
    private voteRepository: Repository<Vote>,
  ) {}

  async createOrUpdateVote(memeId: string, userId: string, type: VoteType) {
    let vote = await this.getUserVote(memeId, userId);

    if (vote) {
      // Se esiste, aggiorna il tipo
      vote.type = type;
    } else {
      // Altrimenti, crea un nuovo voto
      vote = this.voteRepository.create({
        type,
        meme: { id: memeId } as Meme,
        user: { id: userId } as User,
      });
    }

    return this.voteRepository.save(vote);
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
    const vote = await this.voteRepository.findOne({
      where: { id: voteId },
    });

    if (!vote) {
      throw new NotFoundException('Meme not found');
    }

    if (vote.user.id !== userId) {
      throw new ForbiddenException('You are not allowed to delete this meme');
    }

    await this.voteRepository.delete({
      id: voteId,
      user: { id: userId } as User,
    });
  }
}
