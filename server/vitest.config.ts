import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.test.ts', 'src/types/**', 'src/db/seed.ts', 'src/db/migrate.ts'],
    },
    testTimeout: 15_000,
    alias: {
      '@server': path.resolve(import.meta.dirname, 'src'),
    },
  },
});
