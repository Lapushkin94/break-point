import { db } from "./index";
import {
  sessions,
  insights,
  focusCache,
  briefingCache,
  profiles,
  opponents,
} from "./schema";
import {
  cosineDistance,
  desc,
  gt,
  sql,
  and,
  eq,
  type SQL,
  isNull,
  gte,
} from "drizzle-orm";
import { generateEmbedding } from "@/lib/ai/embedding";
import type { LanguageCode } from "@/lib/language";
import type { ThemeMode } from "./schema";

export type SessionFilters = {
  type?: string;
  surface?: string;
  result?: string;
};

// userId is nullable purely for the isNull(...) branch below — every real
// caller now passes a real value, since the proxy gates the whole app.
function ownerCondition(userId: string | null) {
  return userId === null
    ? isNull(sessions.userId)
    : eq(sessions.userId, userId);
}

export async function getSessionById(id: string, userId: string | null) {
  const [row] = await db
    .select()
    .from(sessions)
    .where(and(eq(sessions.id, id), ownerCondition(userId)));
  return row ?? null;
}

export async function getSessions(
  userId: string | null,
  filters: SessionFilters = {},
) {
  const { type, surface, result } = filters;

  const conditions: SQL[] = [ownerCondition(userId)];
  if (type === "training" || type === "match" || type === "rally")
    conditions.push(eq(sessions.type, type));
  if (surface === "hard" || surface === "clay" || surface === "carpet")
    conditions.push(eq(sessions.surface, surface));
  if (result === "win" || result === "loss")
    conditions.push(eq(sessions.result, result));

  return db
    .select()
    .from(sessions)
    .where(and(...conditions))
    .orderBy(desc(sessions.date), desc(sessions.createdAt));
}

export async function searchSessions(
  query: string,
  userId: string | null,
  limit = 8,
) {
  const queryEmbedding = await generateEmbedding(query);

  const similarity = sql<number>`1 - (${cosineDistance(sessions.embedding, queryEmbedding)})`;

  return db
    .select({
      id: sessions.id,
      date: sessions.date,
      type: sessions.type,
      opponent: sessions.opponent,
      result: sessions.result,
      score: sessions.score,
      surface: sessions.surface,
      durationMinutes: sessions.durationMinutes,
      energy: sessions.energy,
      rawText: sessions.rawText,
      whatWorked: sessions.whatWorked,
      whatFailed: sessions.whatFailed,
      coachNotes: sessions.coachNotes,
      similarity,
    })
    .from(sessions)
    .where(and(gt(similarity, 0.2), ownerCondition(userId)))
    .orderBy((t) => desc(t.similarity))
    .limit(limit);
}

export async function getRecentSessions(userId: string | null, limit = 10) {
  return db
    .select()
    .from(sessions)
    .where(ownerCondition(userId))
    .orderBy(desc(sessions.date), desc(sessions.createdAt))
    .limit(limit);
}

export async function getSessionsVsOpponent(
  opponent: string,
  userId: string | null,
) {
  return db
    .select()
    .from(sessions)
    .where(and(eq(sessions.opponent, opponent), ownerCondition(userId)))
    .orderBy(desc(sessions.date), desc(sessions.createdAt));
}

export async function getSessionsSince(isoDate: string, userId: string | null) {
  return db
    .select()
    .from(sessions)
    .where(and(gte(sessions.date, isoDate), ownerCondition(userId)))
    .orderBy(desc(sessions.date), desc(sessions.createdAt));
}

export async function getOpponents(userId: string | null): Promise<string[]> {
  const rows = await db
    .selectDistinct({ opponent: sessions.opponent })
    .from(sessions)
    .where(ownerCondition(userId));
  return rows.map((r) => r.opponent).filter((o): o is string => !!o);
}

// Distinct real people, for the opponent picker — separate from
// getOpponents() above, which only returns distinct name strings from past
// sessions and can't tell two different people with the same name apart.
export async function getOpponentProfiles(userId: string | null) {
  return db
    .select()
    .from(opponents)
    .where(
      userId === null ? isNull(opponents.userId) : eq(opponents.userId, userId),
    )
    .orderBy(opponents.name);
}

export async function createOpponent(
  userId: string,
  name: string,
  description: string | null,
) {
  const [created] = await db
    .insert(opponents)
    .values({ userId, name, description })
    .returning();
  return created;
}

export async function getInsights(userId: string | null) {
  return db
    .select()
    .from(insights)
    .where(
      userId === null ? isNull(insights.userId) : eq(insights.userId, userId),
    )
    .orderBy(desc(insights.periodStart));
}

export async function getLatestSessionCreatedAt(
  userId: string | null,
): Promise<Date | null> {
  const [row] = await db
    .select({ createdAt: sessions.createdAt })
    .from(sessions)
    .where(ownerCondition(userId))
    .orderBy(desc(sessions.createdAt))
    .limit(1);
  return row?.createdAt ?? null;
}

export async function getFocusCache(userId: string | null = null) {
  const [row] = await db
    .select()
    .from(focusCache)
    .where(
      userId === null
        ? isNull(focusCache.userId)
        : eq(focusCache.userId, userId),
    )
    .orderBy(desc(focusCache.generatedAt))
    .limit(1);
  return row ?? null;
}

export async function setFocusCache(
  content: string,
  latestSessionAt: Date | null,
  userId: string | null = null,
) {
  const scope =
    userId === null ? isNull(focusCache.userId) : eq(focusCache.userId, userId);
  await db.transaction(async (tx) => {
    await tx.delete(focusCache).where(scope);
    await tx.insert(focusCache).values({ content, latestSessionAt, userId });
  });
}

export async function getBriefingCache(userId: string | null = null) {
  const [row] = await db
    .select()
    .from(briefingCache)
    .where(
      userId === null
        ? isNull(briefingCache.userId)
        : eq(briefingCache.userId, userId),
    )
    .orderBy(desc(briefingCache.generatedAt))
    .limit(1);
  return row ?? null;
}

export async function setBriefingCache(
  opponent: string,
  content: string,
  userId: string | null = null,
) {
  const scope =
    userId === null
      ? isNull(briefingCache.userId)
      : eq(briefingCache.userId, userId);
  await db.transaction(async (tx) => {
    await tx.delete(briefingCache).where(scope);
    await tx.insert(briefingCache).values({ opponent, content, userId });
  });
}

// Cached content is generated in whatever language was current at the time,
// but staleness is only judged by session recency — it has no way to know
// the user's language preference changed since. Call these when it does.
export async function clearFocusCache(userId: string) {
  await db.delete(focusCache).where(eq(focusCache.userId, userId));
}

export async function clearBriefingCache(userId: string) {
  await db.delete(briefingCache).where(eq(briefingCache.userId, userId));
}

export async function getUserLanguage(userId: string | null): Promise<string> {
  if (userId === null) return "en";
  const [row] = await db
    .select({ language: profiles.language })
    .from(profiles)
    .where(eq(profiles.id, userId));
  return row?.language ?? "en";
}

export async function getUserTheme(userId: string | null): Promise<string> {
  if (userId === null) return "carpet";
  const [row] = await db
    .select({ theme: profiles.theme })
    .from(profiles)
    .where(eq(profiles.id, userId));
  return row?.theme ?? "carpet";
}

export async function updateUserTheme(userId: string, theme: ThemeMode) {
  // Same upsert reasoning as updateUserLanguage below.
  await db
    .insert(profiles)
    .values({ id: userId, theme })
    .onConflictDoUpdate({ target: profiles.id, set: { theme } });
}

export async function getOrCreateProfile(
  userId: string,
): Promise<typeof profiles.$inferSelect> {
  const [existing] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, userId));
  if (existing) return existing;

  const [created] = await db
    .insert(profiles)
    .values({ id: userId })
    .onConflictDoNothing()
    .returning();
  return created ?? (await getOrCreateProfile(userId));
}

export async function updateUserLanguage(
  userId: string,
  language: LanguageCode,
) {
  // Upsert, not a plain update: profile provisioning in the auth callback is
  // best-effort, so a row may not exist yet when this is first called.
  await db
    .insert(profiles)
    .values({ id: userId, language })
    .onConflictDoUpdate({ target: profiles.id, set: { language } });
}
