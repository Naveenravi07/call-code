import { text, pgTable, uuid, pgEnum } from 'drizzle-orm/pg-core';

const providers = ['google', 'github'] as const;
export const pg_provider = pgEnum('provider', providers);

export const users = pgTable('users', {
  id: uuid('id').primaryKey(),
  name: text('name').notNull(),
  pwd: text('pwd'),
  provider: pg_provider('provider').notNull(),
  providerid: text('p_id').notNull(),
  email: text('email'),
  pfp: text('pfp'),
});

export type Provider = (typeof providers)[number];

export interface User {
  id: string;
  name: string;
  pwd: string | null;
  provider: Provider;
  providerid: string;
  email: string | null;
  pfp: string | null;
}

export type NewUser = typeof users.$inferInsert; 