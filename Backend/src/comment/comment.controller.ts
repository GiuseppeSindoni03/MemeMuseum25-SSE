import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { Comment } from 'src/comment/comment.entity';
import { GetUser } from 'src/common/get-user.decorotator';
import { User } from 'src/user/user.entity';
import { AuthGuard } from '@nestjs/passport';

@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post('/:id')
  @UseGuards(AuthGuard('jwt'))
  create(
    @Param('id') memeId: string,
    @Body() dto: CreateCommentDto,
    @GetUser() user: User,
  ): Promise<Comment> {
    return this.commentService.create(user,memeId, dto);
  }

  @Delete('/:id')
  @UseGuards(AuthGuard('jwt'))
  delete(@Param('id') commentId: string, @GetUser() user: User): Promise<void> {
    return this.commentService.delete(commentId, user.id);
  }

  @Get('/:id')
  getById(@Param('id') id: string): Promise<Comment> {
    return this.commentService.getById(id);
  }
}
