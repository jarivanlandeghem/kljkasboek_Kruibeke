import { execSync } from 'child_process';
import path from 'path';

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default async function globalSetup() {
  const cwd = path.resolve(__dirname, '..');
  console.log('Global setup: starting test DB via docker-compose.test.yml');
  try {
    execSync('docker compose -f docker-compose.test.yml up -d', {
      cwd,
      stdio: 'inherit',
    });
    console.log('Waiting for DB to become healthy...');

    // cross-platform wait instead of shell `sleep` which is not available on Windows
    await delay(12_000);

    console.log('Running migrations for test DB (with retries)');

    const maxAttempts = 6;
    let attempt = 0;
    while (attempt < maxAttempts) {
      attempt++;
      try {
        console.log(`Migration attempt ${attempt}/${maxAttempts}`);
        execSync('pnpm db:migrate:test', { cwd, stdio: 'inherit' });
        console.log('Migrations finished');
        break;
      } catch (e) {
        console.warn(`Migration attempt ${attempt} failed, retrying...`);
        if (attempt >= maxAttempts) {
          throw e;
        }
        // wait a bit before next attempt
        await delay(4_000);
      }
    }
  } catch (err) {
    console.error('Global setup failed', err);
    throw err;
  }
}
