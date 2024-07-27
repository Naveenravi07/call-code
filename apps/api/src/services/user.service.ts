import { db } from '$/database/db';
import { User, userTable, Providers } from '$/database/schema/user.schema';
import { and, eq } from 'drizzle-orm';

async function getUserDetailsFromEmail(email: string) {
  const data = await db.select().from(userTable).where(eq(userTable.email, email)).limit(1);
  return data.at(0) || null;
}

async function createNewUser(user: User) {
  const insert = await db.insert(userTable).values(user).returning();
  return insert.at(0) || null;
}

async function getUserById(id: string) {
  const user = await db.select().from(userTable).where(eq(userTable.id, id)).limit(1);
  return user.at(0) || null;
}

async function findUserWithProvider(providerId: string, provider: Providers) {
  const user = await db
    .select()
    .from(userTable)
    .where(and(eq(userTable.provider, provider), eq(userTable.providerid, providerId)))
    .limit(1);
  return user.at(0) || null;
}

export { getUserDetailsFromEmail, createNewUser, getUserById, findUserWithProvider };
