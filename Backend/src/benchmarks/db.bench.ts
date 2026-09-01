import { bench, describe, beforeAll } from 'vitest';
import { MemeService } from '../meme/meme.service';

describe('Eco-Design Benchmark: Database Delegation (Memory Bloat)', () => {
  let memeService: MemeService;
  let mockRepository: any;

  beforeAll(() => {
    const MOCK_DB_SIZE = 10000;
    const rawMockDatabase = Array.from({ length: MOCK_DB_SIZE }).map((_, i) => ({
      id: `meme-${i}`,
      title: `Titolo lungo del meme numero ${i} per testare serializzazione e memoria`,
      imageUrl: `/uploads/meme-${i}.webp`,
      createdAt: new Date(),
      author: { id: 'test', username: 'utente-medio' },
      tags: [],
      comments: [],
      upvoteCount: 0,
      downvoteCount: 0,
    }));

    // Creiamo un Mock del repository TypeORM che risponde alle query
    mockRepository = {
      count: async () => MOCK_DB_SIZE,
      find: async (options?: any) => {
        // Se la query NON usa take/skip (Simulazione vecchia logica: Memory Bloat)
        if (!options || (options.take === undefined && options.skip === undefined)) {
           // Cloniamo pesantemente per simulare l'overhead dell'ORM per tutti i 10000 record
           return JSON.parse(JSON.stringify(rawMockDatabase));
        }

        // Se la query USA take/skip (Simulazione nuova logica: Green Optimizations)
        const skip = options.skip || 0;
        const take = options.take || MOCK_DB_SIZE;
        return JSON.parse(JSON.stringify(rawMockDatabase.slice(skip, skip + take)));
      }
    };

    // Istanziamo IL CODICE REALE del tuo backend
    memeService = new MemeService(
      mockRepository as any,
      {} as any, // Mock del voteRepository (non serve in getTodayMeme)
      {} as any  // Mock del tagService
    );
    
    // Moccamo il formatter per isolare il costo del database/ORM
    memeService.formatMemes = async (memes: any[]) => memes;
  });

  // Aggiungiamo un bench vuoto solo per forzare Vitest a stampare la tabella dei risultati in console
  bench('Reference (Ignorare)', async () => {
    await new Promise(r => setTimeout(r, 1));
  });

  bench('Baseline (Senza skip/take) - Memory Bloat', async () => {
    // SIMULIAMO LA VECCHIA LOGICA (Prima del refactoring Creedengo):
    // Il server caricava TUTTI i meme in memoria e poi li filtrava tramite Javascript.
    const totalMemes = await mockRepository.count();
    const memes = await mockRepository.find({
      relations: ['author', 'tags', 'comments', 'votes'],
      order: { createdAt: 'DESC' }
    });
    
    const dayOfYear = 100; // Valore fittizio
    const memesPerDay = Math.min(5, totalMemes);
    const startIndex = dayOfYear % totalMemes;
    
    // Lo slice (impaginazione) avveniva in RAM (pessima pratica su DB grandi)
    const result = memes.slice(startIndex, startIndex + memesPerDay);
    await memeService.formatMemes(result);
  });

  bench('Eco-Design (Con skip/take) - Database Delegation', async () => {
    // TESTIAMO LA NUOVA LOGICA:
    // Il Service delega la paginazione direttamente al database tramite le opzioni skip/take di TypeORM.
    await memeService.getTodayMeme();
  });
});
