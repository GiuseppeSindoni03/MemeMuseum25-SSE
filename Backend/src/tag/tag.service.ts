import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Tag } from './tag.entity';
import { In, Repository } from 'typeorm';

@Injectable()
export class TagService {
  constructor(
    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>,
  ) {}

  async getAll(): Promise<Tag[]> {
    return this.tagRepository.find();
  }

  async getByName(name: string): Promise<Tag> {
    const found = await this.tagRepository.findOne({ where: { name } });

    if(!found)
        throw new NotFoundException();

    return found;
  }

  async findOrCreateTags(tagNames: string[]): Promise<Tag[]> {
    if (!tagNames || tagNames.length === 0) return [];

    const existingTags = await this.tagRepository.find({
      where: { name: In(tagNames) },
    });
    const existingTagNames = existingTags.map((tag) => tag.name);

    const newTagNames = tagNames.filter(
      (name) => !existingTagNames.includes(name),
    );
    const newTags = this.tagRepository.create(
      newTagNames.map((name) => ({ name })),
    );

    const savedNewTags = await this.tagRepository.save(newTags);

    return [...existingTags, ...savedNewTags];
  }
}
