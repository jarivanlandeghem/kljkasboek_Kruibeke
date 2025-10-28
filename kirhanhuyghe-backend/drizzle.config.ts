import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';
import * as path from 'path';

// load the root .env (adjust ../.env if the file is elsewhere)
dotenv.config({ path: path.resolve(__dirname, '../.env') });

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set');
}

export default defineConfig({
  dialect: 'mysql',
  schema: './src/drizzle/schema.ts',
  out: './migrations',
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
