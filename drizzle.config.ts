import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/database/schema/oidc_state.model.ts',
  out: './migrations',
  dialect: 'postgresql', 
});

