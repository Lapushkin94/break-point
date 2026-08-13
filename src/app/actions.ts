"use server";

import { db } from "@/db";
import { sessions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { generateEmbedding, sessionToEmbeddingText } from "@/lib/ai/embedding";

// The shape the form sends. All the optional context fields are optional here too.
export type SessionInput = {
  type: "training" | "match" | "rally";
  date: string;
  opponent?: string | null;
  score?: string | null;
  result?: "win" | "loss" | null;
  surface?: "hard" | "clay" | "carpet" | null;
  durationMinutes?: number | null;
  energy?: number | null;
  mood?: number | null;
  rawText: string;
  whatWorked?: string[];
  whatFailed?: string[];
  coachNotes?: string[];
};

export async function createSession(data: SessionInput) {
  // Embedding is best-effort: a save must never fail just because the
  // embedding call did. Sessions with a null embedding are picked up later
  // by scripts/backfill-embeddings.ts.
  let embedding: number[] | null = null;
  try {
    embedding = await generateEmbedding(sessionToEmbeddingText({ ...data }));
  } catch (e) {
    console.error("Failed to generate embedding for session:", e);
  }
  await db.insert(sessions).values({ ...data, embedding });
  revalidatePath("/");
}

export async function updateSession(id: string, data: Partial<SessionInput>) {
  await db.update(sessions).set(data).where(eq(sessions.id, id));
  revalidatePath("/");
}

export async function deleteSession(id: string) {
  await db.delete(sessions).where(eq(sessions.id, id));
  revalidatePath("/");
}
