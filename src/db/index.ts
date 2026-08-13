import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

// The postgres client. prepare: false is REQUIRED for Supabase's
// transaction pooler — it doesn't support prepared statements.
//
// This connects as Supabase's `postgres` role, which has BYPASSRLS — the RLS
// policies in schema.ts do NOT constrain queries made through this client.
// They protect the Supabase API path (PostgREST / anon key / client-side
// supabase-js) as defense-in-depth; this app's own correctness depends on
// the userId filtering in queries.ts and actions.ts.
const client = postgres(process.env.DATABASE_URL!, { prepare: false });

export const db = drizzle({ client });
