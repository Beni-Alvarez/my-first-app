import { configDefaults, defineConfig } from 'vitest/config';

// Fast tests that need no database. Database tests live in *.db.test.ts (see vitest.db.config.ts).
export default defineConfig({
  test: {
    environment: 'node',
    exclude: [...configDefaults.exclude, '**/*.db.test.ts'],
  },
});
