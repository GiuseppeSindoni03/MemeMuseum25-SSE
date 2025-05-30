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
import { FileUploadInterceptor } from 'src/common/file-upload.interceptor';
import { GetUser } from 'src/common/get-user.decorator';
import { User } from 'src/user/user.entity';
import { AuthGuard } from '@nestjs/passport';
import { Comment } from 'src/comment/comment.entity';
import { JwtOptionalAuthGuard } from 'src/common/jwt-optional-auth.guard';
import { SearchDto } from './dto/search.dto';
import { MemeResponseDto } from './dto/meme-response.dto';

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
  ): Promise<any> {
    return this.memeService.createMeme(user, dto, file.filename);
  }

  @UseGuards(JwtOptionalAuthGuard)
  @Get()
  getAllMemes(@GetUser() user: User): Promise<MemeResponseDto[]> {
    if (user) return this.memeService.getAll(user.id);

    return this.memeService.getAll();
  }

  @Post('/search')
  search(
    @Body() searchDto: SearchDto,
    @GetUser() user: User,
  ): Promise<MemeResponseDto[]> {
    return this.memeService.search(searchDto, user?.id);
  }

  @Get('/today')
  getTodayMemes(): Promise<MemeResponseDto[]> {
    return this.memeService.getTodayMeme();
  }

  @Get('/mine')
  @UseGuards(AuthGuard('jwt'))
  getMyMemes(@GetUser() user: User,): Promise<MemeResponseDto[]> {
    console.log("test");
    return this.memeService.getMyMemes(user.id);
  }

  @Get('/my-upvoted-memes')
  @UseGuards(AuthGuard('jwt'))
  async getMyUpvotedMemes(@GetUser() user: User) {
    return this.memeService.getMyUpvotedMemes(user.id);
  }

  @UseGuards(JwtOptionalAuthGuard)
  @Get('/:id')
  async getById(
    @Param('id') memeId: string,
    @GetUser() user: User,
  ): Promise<any> {
    if (user) return this.memeService.getById(memeId, user.id);

    return this.memeService.getById(memeId);
  }

  @Delete('/:id')
  @UseGuards(AuthGuard('jwt'))
  async delete(@Param('id') id: string, @GetUser() user: User): Promise<void> {
    return this.memeService.delete(user.id, id);
  }
}
