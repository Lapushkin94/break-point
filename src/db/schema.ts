import {
  pgTable,
  uuid,
  text,
  timestamp,
  date,
  jsonb,
  integer,
  pgEnum,
} from "drizzle-orm/pg-core";

export const sessionType = pgEnum("session_type", [
  "training",
  "match",
  "rally",
]);
export const matchResult = pgEnum("match_result", ["win", "loss"]);
export const surfaceType = pgEnum("surface_type", ["hard", "clay", "carpet"]);

export const sessions = pgTable("sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id"),
  type: sessionType("type").notNull(),
  date: date("date").notNull(),

  // Match-specific (null for training)
  opponent: text("opponent"),
  score: text("score"),
  result: matchResult("result"),

  // Context (all optional)
  surface: surfaceType("surface"),
  durationMinutes: integer("duration_minutes"),
  energy: integer("energy"), // self-rating 1–5
  mood: integer("mood"), // self-rating 1–5

  // The note + AI-derived structure
  rawText: text("raw_text").notNull(),
  whatWorked: jsonb("what_worked").$type<string[]>().default([]),
  whatFailed: jsonb("what_failed").$type<string[]>().default([]),
  coachNotes: jsonb("coach_notes").$type<string[]>().default([]),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export const insights = pgTable("insights", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id"),
  periodStart: date("period_start").notNull(),
  periodEnd: date("period_end").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Single-row-per-user cache for "Focus for today" — avoids re-generating on
// every dialog open. Valid until it expires (see route) or a newer session
// exists. userId is null until real accounts exist; every query/write is
// scoped by it so this stays correct once they do.
export const focusCache = pgTable("focus_cache", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id"),
  content: text("content").notNull(),
  generatedAt: timestamp("generated_at").defaultNow().notNull(),
  latestSessionAt: timestamp("latest_session_at"),
});

// Single-row-per-user cache for the last "Match briefing" generated —
// reopening the page within the TTL shows the same opponent + text right
// away instead of resetting to the picker. Same per-user scoping as above.
export const briefingCache = pgTable("briefing_cache", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id"),
  opponent: text("opponent").notNull(),
  content: text("content").notNull(),
  generatedAt: timestamp("generated_at").defaultNow().notNull(),
});

export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;

export type Insight = typeof insights.$inferSelect;
export type NewInsight = typeof insights.$inferInsert;

export type FocusCache = typeof focusCache.$inferSelect;
export type NewFocusCache = typeof focusCache.$inferInsert;

export type BriefingCache = typeof briefingCache.$inferSelect;
export type NewBriefingCache = typeof briefingCache.$inferInsert;
