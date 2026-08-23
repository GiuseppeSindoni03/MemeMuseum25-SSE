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
  ClassSerializerInterceptor,
  UseInterceptors,
  Query,
  InternalServerErrorException,
} from '@nestjs/common';
import { MemeService } from './meme.service';
import { CreateMemeDto } from './dto/create-meme.dto';
import { FileUploadInterceptor } from 'src/common/file-upload.interceptor';
import { GetUser } from 'src/common/get-user.decorator';
import { User } from 'src/user/user.entity';
import { AuthGuard } from '@nestjs/passport';
import { JwtOptionalAuthGuard } from 'src/common/jwt-optional-auth.guard';
import { SearchDto } from './dto/search.dto';
import { MemeResponseDto } from './dto/meme-response.dto';

const sharp = require('sharp');
import * as path from 'path';
import * as fs from 'fs';

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
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const filename = `meme-${uniqueSuffix}.webp`;
    const outputPath = path.join(process.cwd(), 'uploads', filename);
    
    try {
      if (!file || !file.buffer) {
        throw new InternalServerErrorException('File o file.buffer mancante!');
      }
      await sharp(file.buffer)
        .resize(650, 650, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(outputPath);
    } catch (error: any) {
      console.error('Errore sharp:', error);
      throw new InternalServerErrorException(`Errore durante l'ottimizzazione dell'immagine: ${error.message}`);
    }

    return this.memeService.createMeme(user, dto, filename);
  }

  @UseGuards(JwtOptionalAuthGuard)
  @Get()
  getAllMemes(
    @GetUser() user: User,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ): Promise<{ memes: MemeResponseDto[]; total: number }> {
    const parsedLimit = Number(limit) || 10;
    const parsedOffset = Number(offset) || 0;

    return this.memeService.getAllPaginated(
      user?.id,
      parsedLimit,
      parsedOffset,
    );
  }

  @Post('/search')
  search(
    @Body() searchDto: SearchDto,
    @GetUser() user: User,
    @Query('limit') limit = 10,
    @Query('offset') offset = 0,
  ): Promise<{ memes: MemeResponseDto[]; total: number }> {
    return this.memeService.search(searchDto, user?.id, +limit, +offset);
  }

  @Get('/mine')
  @UseGuards(AuthGuard('jwt'))
  getMyMemes(
    @GetUser() user: User,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ): Promise<{ memes: MemeResponseDto[]; total: number }> {
    const parsedLimit = Number(limit) || 10;
    const parsedOffset = Number(offset) || 0;

    return this.memeService.getMyMemes(user.id, parsedLimit, parsedOffset);
  }
  @Get('/my-upvoted-memes')
  @UseGuards(AuthGuard('jwt'))
  getMyUpvotedMemes(
    @GetUser() user: User,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ): Promise<{ memes: MemeResponseDto[]; total: number }> {
    const parsedLimit = Number(limit) || 10;
    const parsedOffset = Number(offset) || 0;

    return this.memeService.getMyUpvotedMemesPaginated(
      user.id,
      parsedLimit,
      parsedOffset,
    );
  }

  @Get('/today')
  getTodayMemes(): Promise<MemeResponseDto[]> {
    return this.memeService.getTodayMeme();
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
