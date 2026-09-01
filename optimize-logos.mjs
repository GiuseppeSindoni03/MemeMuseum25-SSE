import sharp from 'sharp';
import fs from 'fs';

const assetsDir = './Frontend/MemeMuseum/src/assets';

async function optimize(filename) {
  const input = `${assetsDir}/${filename}`;
  const output = `${assetsDir}/${filename.replace('.png', '.webp')}`;
  
  if (fs.existsSync(input)) {
    await sharp(input)
      .resize(150) // ridimensiona a max 150px (ideale per loghi)
      .webp({ quality: 80 })
      .toFile(output);
    console.log(`Optimized ${filename} to WebP`);
  }
}

await optimize('logo.png');
await optimize('logoSad.png');
