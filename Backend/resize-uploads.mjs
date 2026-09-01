import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const uploadsDir = './uploads';

async function resizeUploads() {
  const files = fs.readdirSync(uploadsDir);
  for (const file of files) {
    if (file.endsWith('.webp')) {
      const filePath = path.join(uploadsDir, file);
      const tempPath = path.join(uploadsDir, `temp-${file}`);
      
      await sharp(filePath)
        .resize({ width: 412, withoutEnlargement: true })
        .toFile(tempPath);
        
      fs.renameSync(tempPath, filePath);
    }
  }
  console.log('All uploads resized to max 412px width.');
}

resizeUploads();
