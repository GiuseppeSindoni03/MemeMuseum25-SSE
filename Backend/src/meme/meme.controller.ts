import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UploadedFile,
  UseGuards,
  UnauthorizedException,
  ClassSerializerInterceptor,
  UseInterceptors,
} from '@nestjs/common';
import { MemeService } from './meme.service';
import { CreateMemeDto } from './dto/create-meme.dto';
import { UpdateMemeDto } from './dto/update-meme.dto';
import { FileUploadInterceptor } from 'src/common/file-upload.interceptor';
import { GetUser } from 'src/common/get-user.decorator';
import { User } from 'src/user/user.entity';
import { AuthGuard } from '@nestjs/passport';
import { Meme } from './meme.entity';
import { Comment } from 'src/comment/comment.entity';
import { MemePreviewDto } from './dto/meme-preview.dto';
import { plainToInstance } from 'class-transformer';
import { JwtOptionalAuthGuard } from 'src/common/jwt-optional-auth.guard';

@Controller('meme')
@UseInterceptors(ClassSerializerInterceptor)
export class MemeController {
  constructor(private readonly memeService: MemeService) {}

  @Post()
  @FileUploadInterceptor()
  @UseGuards(AuthGuard('jwt'))
  async createMeme(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: CreateMemeDto,
    @GetUser() user: User,
  ):Promise<any> {
    return this.memeService.createMeme(user, dto, file.filename);
  }
  
  @UseGuards(JwtOptionalAuthGuard)
  @Get()
  getAllMemes(@GetUser() user: User):Promise<MemePreviewDto[]> {
    if(user)
      return this.memeService.getAll(user.id);

    return this.memeService.getAll();
  }

  @UseGuards(JwtOptionalAuthGuard)
  @Get('/:id')
  async getById(
    @Param('id') memeId: string,
    @GetUser() user: User
  ): Promise<MemePreviewDto> {
    if(user)
      return this.memeService.getById(memeId,user.id);

    return this.memeService.getById(memeId);
  }
 
  @Get('/vote/:memeId')
  getVoteCount(@Param('memeId') memeId: string):Promise<{ up: number; down: number }> {
    return this.memeService.countVotes(memeId);
  } 

  @Get('/comments/:memeId')
  getComments(@Param('memeId') memeId: string):Promise<Comment[]> {
    return this.memeService.getComments(memeId);
  } 

  @Patch('/:id')
  update(@Param('id') id: string, @Body() updateMemeDto: UpdateMemeDto) {
    return this.memeService.update(+id, updateMemeDto);
  } /* ToDo */

  @Delete('/:id')
  @UseGuards(AuthGuard('jwt'))
  async delete(
    @Param('id') id: string, 
    @GetUser() user: User
  ):Promise<void> {

    return this.memeService.delete(user.id, id);
  }
}
