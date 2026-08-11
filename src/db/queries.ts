import { db } from "./index";
import { sessions } from "./schema";
import { and, desc, eq, gte, type SQL } from "drizzle-orm";

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
