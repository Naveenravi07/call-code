import type { Config } from 'drizzle-kit';
import * as dotenv from 'dotenv';
import { setupEnv } from './src/config/env.utils';

// Load environment variables
setupEnv();

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined');
}

export default {
  schema: './src/database/schema/*',
  out: './migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
} satisfies Config