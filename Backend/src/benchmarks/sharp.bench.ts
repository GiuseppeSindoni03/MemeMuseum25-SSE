import { bench, describe, beforeAll } from 'vitest';
import * as sharp from 'sharp';

describe('Eco-Design Benchmark: Image Processing Trade-off', () => {
  let rawImageBuffer: Buffer;

  beforeAll(async () => {
    // Generiamo un'immagine raw non compressa di 3000x2000 in memoria 
    // per simulare la tipica foto pesante caricata dall'utente
    rawImageBuffer = await sharp({
      create: {
        width: 3000,
        height: 2000,
        channels: 4,
        background: { r: 255, g: 0, b: 0, alpha: 1 }
      }
    })
    .jpeg()
    .toBuffer();
  });


  // Aggiungiamo un bench vuoto solo per forzare Vitest a stampare la tabella dei risultati
  bench('Reference (Ignorare)', async () => {
    await new Promise(r => setTimeout(r, 1));
  });

  bench('Senza Elaborazione (Baseline Before)', async () => {
  // Prima dell'ottimizzazione: il server salvava il buffer raw senza convertirlo
  const buffer = Buffer.from(rawImageBuffer);
});


  bench('Eco-Design Optimised: Resize e conversione WebP', async () => {
    // Dopo il refactoring: Il server processa l'immagine.
    // Misuriamo quanti millisecondi costa alla CPU convertire in WebP a 412px
    await sharp(rawImageBuffer)
      .resize(412, 412, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer(); 
  });
});
