import { bench, describe, beforeAll } from 'vitest';
import * as zlib from 'zlib';

describe('Eco-Design Benchmark: Payload Compression Trade-off', () => {
  let mockPayload: string;

  beforeAll(() => {
    // Generiamo un array JSON di 100 memes (tipica risposta per il feed)
    const mockMemes = Array.from({ length: 100 }).map((_, i) => ({
      id: `meme-${i}`,
      title: `Titolo lungo del meme numero ${i} per testare la compressione GZIP in modo realistico. Aggiungiamo testo extra per aumentare il payload.`,
      imageUrl: `/uploads/meme-${i}.webp`,
      createdAt: new Date(),
      author: 'utente-medio-molto-attivo',
      tags: ['funny', 'relatable', 'programming', 'student-life'],
      commentsCount: Math.floor(Math.random() * 50),
      upvote: Math.floor(Math.random() * 1000),
      downvote: Math.floor(Math.random() * 10),
    }));

    mockPayload = JSON.stringify(mockMemes);
  });

  bench('Reference (Ignorare)', async () => {
    await new Promise((r) => setTimeout(r, 1));
  });

  bench('Senza Compressione (Ritorna JSON grezzo)', () => {
    // Simuliamo l'invio della stringa JSON al client senza compressione (meno carico CPU)
    const data = Buffer.from(mockPayload, 'utf-8');
  });

  bench('Con Compressione Gzip (Ottimizzazione Rete)', () => {
    // Simuliamo il server che comprime il payload con Gzip (costo CPU aggiuntivo)
    const compressed = zlib.gzipSync(mockPayload);
  });
});
