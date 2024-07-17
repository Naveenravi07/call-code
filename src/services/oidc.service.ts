import { CustomError } from "$/classes/CustomError.class";
import { db } from "$/database/db";
import { oidc_model } from "$/database/schema/oidc_state.model";
import { eq } from "drizzle-orm";

export async function saveOIDC_Credentials(key: string, value: string) {
    await db.insert(oidc_model).values({ sessionId: key, value: value })
}


export async function getOIDC_Credentials(key: string) {
    let data = await db.select().from(oidc_model).where(eq(oidc_model.sessionId, key)).limit(1)
    if (data.length == 0) return null
    return data[0]
}
