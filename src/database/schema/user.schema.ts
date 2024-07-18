import { text, pgTable, uuid, pgEnum } from "drizzle-orm/pg-core";

export const providers = pgEnum('provider', ['google',]);

export const userTable = pgTable('users', {
  id: uuid('id').primaryKey(),
  name: text('name').notNull(),
  pwd:text('pwd'),
  provider:providers('provider').notNull(),
  providerid:text('p_id').notNull(),
  email:text('email').notNull(),
  pfp:text('pfp')
});

export type User = typeof userTable.$inferSelect