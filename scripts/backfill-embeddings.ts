import "dotenv/config";

import { db } from "@/db";
import { sessions } from "@/db/schema";
import { isNull, eq } from "drizzle-orm";
import { generateEmbedding, sessionToEmbeddingText } from "@/lib/ai/embedding";

async function main() {
  const rows = await db
    .select()
    .from(sessions)
    .where(isNull(sessions.embedding));
  console.log(`Backfilling ${rows.length} sessions...`);

  for (const s of rows) {
    const text = sessionToEmbeddingText(s);
    const embedding = await generateEmbedding(text);
    await db.update(sessions).set({ embedding }).where(eq(sessions.id, s.id));
    console.log(`✓ ${s.date} ${s.type}`);
  }
  console.log("Done.");
  process.exit(0);
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
