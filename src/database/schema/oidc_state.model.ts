import { pgTable, varchar, uuid, timestamp } from "drizzle-orm/pg-core";

const oidc_model = pgTable('oidc_state_store', {
    sessionId: uuid('id').primaryKey(),
    value: varchar('value', { length: 256 }).notNull(),
    timestamp1: timestamp('timestamp').notNull().defaultNow(),
});


export { oidc_model }
