"use server";

import { db } from "@/db";
import { sessions } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { generateEmbedding, sessionToEmbeddingText } from "@/lib/ai/embedding";
import { getCurrentUserId } from "@/lib/auth";
import { createOpponent } from "@/db/queries";

// The shape the form sends. All the optional context fields are optional here too.
export type SessionInput = {
  type: "training" | "match" | "rally";
  date: string;
  opponent?: string | null;
  opponentDescription?: string | null;
  opponentId?: string | null;
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
  opponentDetails?: string[];
};

export async function createSession(data: SessionInput) {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error("Not authenticated");

  // Embedding is best-effort: a save must never fail just because the
  // embedding call did. Sessions with a null embedding are picked up later
  // by scripts/backfill-embeddings.ts.
  let embedding: number[] | null = null;
  try {
    embedding = await generateEmbedding(sessionToEmbeddingText({ ...data }));
  } catch (e) {
    console.error("Failed to generate embedding for session:", e);
  }
  await db.insert(sessions).values({ ...data, embedding, userId });
  revalidatePath("/");
}

export async function updateSession(id: string, data: Partial<SessionInput>) {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error("Not authenticated");

  // Ownership check: the app's DB connection uses Supabase's postgres role,
  // which bypasses RLS, so this filter — not RLS — is what actually stops
  // one user from editing another's row by guessing its id.
  const [existing] = await db
    .select()
    .from(sessions)
    .where(and(eq(sessions.id, id), eq(sessions.userId, userId)));
  if (!existing) throw new Error("Session not found");

  // Regenerate from the merged (existing + incoming) content, since `data`
  // may only carry the fields that actually changed. Best-effort, same as
  // createSession: on failure, keep the existing embedding rather than
  // losing it — stale is better than gone.
  const merged = { ...existing, ...data };
  let embedding = existing.embedding;
  try {
    embedding = await generateEmbedding(sessionToEmbeddingText(merged));
  } catch (e) {
    console.error("Failed to regenerate embedding for session:", e);
  }

  await db
    .update(sessions)
    .set({ ...data, embedding })
    .where(and(eq(sessions.id, id), eq(sessions.userId, userId)));
  revalidatePath("/");
}

export async function deleteSession(id: string) {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error("Not authenticated");

  await db
    .delete(sessions)
    .where(and(eq(sessions.id, id), eq(sessions.userId, userId)));
  revalidatePath("/");
}

export async function createOpponentAction(
  name: string,
  description: string | null,
) {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error("Not authenticated");
  return createOpponent(userId, name, description);
}
