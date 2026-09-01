import sharp from 'sharp';
import fs from 'fs';

const assetsDir = '../Frontend/MemeMuseum/src/assets';

async function optimize(filename) {
  const input = `${assetsDir}/${filename}`;
  const output = `${assetsDir}/${filename.replace('.png', '.webp')}`;
  
  if (fs.existsSync(input)) {
    await sharp(input)
      .resize({ height: 35 }) 
      .webp({ quality: 80 })
      .toFile(output);
    console.log(`Optimized ${filename} to WebP`);
  }
}

await optimize('logo.png');
await optimize('logoSad.png');
