import { bench, describe, beforeAll } from 'vitest';
import * as bcrypt from 'bcryptjs';

describe('Security Benchmark: Bcrypt CPU Bottleneck', () => {
  let passwordPlain: string;
  let passwordHash: string;

  beforeAll(async () => {
    passwordPlain = 'SuperSecretPassword123!';
    // Generiamo un hash con salt = 10 (il default standard usato per motivi di sicurezza)
    passwordHash = await bcrypt.hash(passwordPlain, 10);
  });

  bench('Reference (Ignorare)', async () => {
    await new Promise(r => setTimeout(r, 1));
  });

  bench('Semplice comparazione di stringhe (Insecure)', () => {
    // Simuliamo un controllo password insicuro senza hashing (praticamente a costo zero per la CPU)
    const isValid = (passwordPlain === 'SuperSecretPassword123!');
  });

  bench('Bcrypt Compare (Security Trade-off)', async () => {
    // Simuliamo l'endpoint di login di NestJS: questo blocca l'Event Loop di Node per svariati ms
    const isValid = await bcrypt.compare(passwordPlain, passwordHash);
  });
});
