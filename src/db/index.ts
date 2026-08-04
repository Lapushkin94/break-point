import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

// The postgres client. prepare: false is REQUIRED for Supabase's
// transaction pooler — it doesn't support prepared statements.
const client = postgres(process.env.DATABASE_URL!, { prepare: false });

export const db = drizzle({ client });
