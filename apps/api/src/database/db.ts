import { drizzle } from "drizzle-orm/node-postgres";
import { Client } from "pg";
import dotenv from "dotenv";

dotenv.config();

const serverUrl =
  process.env.NODE_ENV === "production"
    ? process.env.DB_PROD_URL_WITH_DOCKER
    : process.env.DB_LOCAL_URL;

const client = new Client({
  connectionString: serverUrl,
});

const db = drizzle(client);
export { db, client };
