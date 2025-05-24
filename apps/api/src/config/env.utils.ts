import { config } from 'dotenv';
import { expand } from 'dotenv-expand';
import * as path from 'path';

function loadEnvFile(envPath: string) {
  const env = config({ path: envPath });
  expand(env);
}

export function setupEnv() {
  const NODE_ENV = process.env.NODE_ENV || 'development';
  const envFiles = [
    `.env.${NODE_ENV}.local`, // .env.development.local, .env.production.local
    `.env.${NODE_ENV}`,       // .env.development, .env.production
    '.env'                    // .env
  ];

  for (const file of envFiles) {
    loadEnvFile(path.resolve(process.cwd(), file));
  }
} 