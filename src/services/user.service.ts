import { db } from "$/database/db";
import { User, userTable } from "$/database/schema/user.schema";
import { eq } from "drizzle-orm";

async function getUserDetailsFromEmail(email:string){
    let data = await db.select().from(userTable).where(eq(userTable.email,email)).limit(1)
    return data.at(0) || null;
}

async function createNewUser(user:User){
    let insert = await db.insert(userTable).values(user).returning()
    return insert.at(0) || null;
}

async function getUserById(id:string){
    let user = await db.select().from(userTable).where(eq(userTable.id,id)).limit(1)
    return user.at(0) || null;
}

export {getUserDetailsFromEmail,createNewUser,getUserById}