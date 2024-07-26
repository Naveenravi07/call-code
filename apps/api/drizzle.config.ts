import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/database/schema',
  out: './migrations',
  dialect: 'postgresql',
});
