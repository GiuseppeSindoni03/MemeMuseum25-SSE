import { UnsupportedMediaTypeException, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { extname, join } from 'path';

export function FileUploadInterceptor() {
  return UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
          return cb(
            new UnsupportedMediaTypeException(
              'Only image files are allowed (jpg, jpeg, png, gif)',
            ),
            false,
          );
        }
        cb(null, true);
      },
    }),
  );
}
