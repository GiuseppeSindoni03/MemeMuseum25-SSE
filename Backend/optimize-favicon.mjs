import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const publicDir = '../Frontend/MemeMuseum/public';
const inputPath = path.join(publicDir, 'logo.png');
const outputPath = path.join(publicDir, 'logo.webp');

async function optimizeFavicon() {
  if (fs.existsSync(inputPath)) {
    await sharp(inputPath)
      .resize({ width: 128, height: 128 }) // perfetta per una favicon
      .webp({ quality: 80 })
      .toFile(outputPath);
      
    // Eliminiamo il PNG originale pesante dalla cartella public
    fs.unlinkSync(inputPath);
    console.log('Favicon ottimizzata e vecchio file rimosso!');
  }
}

optimizeFavicon();
