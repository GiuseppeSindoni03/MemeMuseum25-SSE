import { bench, describe, beforeAll } from 'vitest';

describe('Eco-Design Benchmark: In-Memory Cache vs Database Query', () => {
  let mockDatabase: any[];
  let memoryCache: Map<string, any>;
  const MOCK_DB_SIZE = 5000;

  beforeAll(() => {
    // Simuliamo un DB con 5000 records
    mockDatabase = Array.from({ length: MOCK_DB_SIZE }).map((_, i) => ({
      id: `meme-${i}`,
      title: `Titolo meme ${i}`,
      imageUrl: `/uploads/meme-${i}.webp`,
      createdAt: new Date(),
      author: { id: 'test', username: 'utente-medio' },
    }));

    // Inizializziamo una cache in memoria e pre-carichiamo il risultato di una query
    memoryCache = new Map();
    memoryCache.set('today_memes', mockDatabase.slice(0, 5));
  });

  bench('Reference (Ignorare)', async () => {
    await new Promise((r) => setTimeout(r, 1));
  });

  bench('Senza Cache (Query DB simulata)', async () => {
    // Simuliamo il costo di un'operazione ORM per recuperare e serializzare i dati
    const result = JSON.parse(JSON.stringify(mockDatabase.slice(0, 5)));
  });

  bench('Con In-Memory Cache (Risposta istantanea)', async () => {
    // Simuliamo il recupero istantaneo dalla mappa in RAM
    const result = memoryCache.get('today_memes');
  });
});
