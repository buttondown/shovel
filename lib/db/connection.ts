import { Kysely } from "kysely";
import { NeonDialect } from "kysely-neon";
import { Database } from "./types";

export const db = new Kysely<Database>({
  dialect: new NeonDialect({
    connectionString: process.env.DATABASE_URL,
  }),
});
