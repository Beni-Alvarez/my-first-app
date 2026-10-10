import { execSync } from 'node:child_process';

// Runs once before the database tests: checks the test DB URL and applies all migrations to it.
export default function setup(): void {
  const url = process.env.TEST_DATABASE_URL;
  if (!url) {
    throw new Error('TEST_DATABASE_URL is not set. Add it to server/.env (see .env.example).');
  }
  // Safety net: the tests delete all songs, so never run them against a non-test database.
  if (!new URL(url).pathname.includes('test')) {
    throw new Error(`TEST_DATABASE_URL must point to a test database (name containing "test").`);
  }
  execSync('npx prisma migrate deploy', {
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: url },
  });
}
