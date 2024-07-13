import { drizzle } from "drizzle-orm/node-postgres";
import { Client } from "pg";

const client = new Client({
    connectionString: "postgres://shastri@db:5432/karohost",
  });

const db = drizzle(client);
export {db,client}