import { execSync } from 'child_process';
import path from 'path';

export default async function globalTeardown() {
  const cwd = path.resolve(__dirname, '..');
  console.log('Global teardown: stopping test DB');
  try {
    execSync('docker compose -f docker-compose.test.yml down -v', { cwd, stdio: 'inherit' });
    console.log('Test DB stopped');
  } catch (err) {
    console.error('Global teardown failed', err);
  }
}
