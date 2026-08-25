import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { TransformInterceptor } from './common/transform.interceptor';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';

import * as compression from 'compression';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const logger = new Logger();

  app.use(compression());

  app.useStaticAssets(join(process.cwd(), 'uploads'), { 
    prefix: '/uploads',
    setHeaders: (res) => {
      res.set('Cache-Control', 'public, max-age=31536000');
    }
  });
  
  app.enableCors({
    origin: ['http://localhost:5173','http://mememuseum.duckdns.org:5173'],
    credentials: true,
  });
  
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true, 
      forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalInterceptors(new TransformInterceptor());
  await app.listen(process.env.PORT ?? 3001);
  logger.log(`Application listening on port ${process.env.PORT ?? 3001}`);
}
bootstrap();
