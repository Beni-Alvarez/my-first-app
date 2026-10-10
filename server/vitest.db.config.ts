import { existsSync } from 'node:fs';
import { defineConfig } from 'vitest/config';

// Integration tests against a real PostgreSQL test database (npm run test:db).
if (existsSync('.env')) {
  process.loadEnvFile('.env');
}

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.db.test.ts'],
    globalSetup: ['./src/test/db-global-setup.ts'],
    // All test files share one database, so run them one after another.
    fileParallelism: false,
  },
});
