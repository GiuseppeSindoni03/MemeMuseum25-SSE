import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TagService } from './tag.service';
import { Tag } from './tag.entity';

@Controller('tag')
export class TagController {
  constructor(private readonly tagService: TagService) {}

  @Get()
  async getAll(): Promise<Tag[]> {
    return this.tagService.getAll();
  }

  @Get('/:name')
  async getByName(@Param('name') name: string): Promise<Tag> {
    return this.tagService.getByName(name);
  }
}
