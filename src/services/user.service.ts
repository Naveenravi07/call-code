import { db } from "$/database/db";
import { User, userTable } from "$/database/schema/user.schema";
import { eq } from "drizzle-orm";

async function getUserDetailsFromEmail(email:string){
    let data = await db.select().from(userTable).where(eq(userTable.email,email)).limit(1)
    if(data.length == 0 ) return null
    return data[0]
}

async function createNewUser(user:User){
    let insert = await db.insert(userTable).values(user).returning()
    return insert[0]
}

export {getUserDetailsFromEmail,createNewUser}