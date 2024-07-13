import { drizzle } from "drizzle-orm/node-postgres";
import { Client } from "pg";

const client = new Client({
    connectionString: "postgres://shastri:password@0.0.0.0:5432/karohost",
  });

const db = drizzle(client);

export {db,client}