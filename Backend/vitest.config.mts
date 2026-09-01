import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  clearScreen: false,
  test: {
    alias: {
      'src': path.resolve(import.meta.dirname, './src')
    }
  }
});
