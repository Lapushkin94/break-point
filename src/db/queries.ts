import { db } from "./index";
import { sessions } from "./schema";
import { and, desc, eq, type SQL } from "drizzle-orm";

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
