import { db } from "./index";
import { sessions, insights, focusCache, briefingCache } from "./schema";
import { and, desc, eq, gte, isNull, type SQL } from "drizzle-orm";

export type SessionFilters = {
  type?: string;
  surface?: string;
  result?: string;
};

export async function getSessions(filters: SessionFilters = {}) {
  const { type, surface, result } = filters;

  const conditions: SQL[] = [];
  if (type === "training" || type === "match" || type === "rally")
    conditions.push(eq(sessions.type, type));
  if (surface === "hard" || surface === "clay" || surface === "carpet")
    conditions.push(eq(sessions.surface, surface));
  if (result === "win" || result === "loss")
    conditions.push(eq(sessions.result, result));

  return db
    .select()
    .from(sessions)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(sessions.date));
}

// do i need filtering here?
export async function getRecentSessions(limit = 10) {
  return db.select().from(sessions).orderBy(desc(sessions.date)).limit(limit);
}

export async function getSessionsVsOpponent(opponent: string) {
  return db
    .select()
    .from(sessions)
    .where(eq(sessions.opponent, opponent))
    .orderBy(desc(sessions.date));
}

export async function getSessionsSince(isoDate: string) {
  return db
    .select()
    .from(sessions)
    .where(gte(sessions.date, isoDate))
    .orderBy(desc(sessions.date));
}

export async function getOpponents(): Promise<string[]> {
  const rows = await db
    .selectDistinct({ opponent: sessions.opponent })
    .from(sessions);
  return rows.map((r) => r.opponent).filter((o): o is string => !!o);
}

export async function getInsights() {
  return db.select().from(insights).orderBy(desc(insights.periodStart));
}

export async function getLatestSessionCreatedAt(): Promise<Date | null> {
  const [row] = await db
    .select({ createdAt: sessions.createdAt })
    .from(sessions)
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
