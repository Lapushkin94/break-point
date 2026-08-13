import {
  pgTable,
  uuid,
  text,
  timestamp,
  date,
  jsonb,
  integer,
  pgEnum,
  vector,
  index,
  pgPolicy,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const sessionType = pgEnum("session_type", [
  "training",
  "match",
  "rally",
]);
export const matchResult = pgEnum("match_result", ["win", "loss"]);
export const surfaceType = pgEnum("surface_type", ["hard", "clay", "carpet"]);
export const languageCode = pgEnum("language_code", ["en", "ru", "el"]);
export const themeMode = pgEnum("theme_mode", ["light", "dark"]);

// RLS policies below protect the Supabase API path (PostgREST / anon key /
// any future client-side supabase-js use). They do NOT protect this app's
// own queries — the Drizzle connection uses Supabase's postgres role, which
// bypasses RLS (see src/db/index.ts). App correctness still depends on the
// userId filtering already done in src/db/queries.ts and src/app/actions.ts.
export const sessions = pgTable(
  "sessions",
  {
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

    embedding: vector("embedding", { dimensions: 1536 }),
  },
  (t) => [
    index("sessions_embedding_idx").using(
      "hnsw",
      t.embedding.op("vector_cosine_ops"),
    ),
    pgPolicy("own sessions", {
      for: "all",
      to: "authenticated",
      using: sql`(select auth.uid()) = ${t.userId}`,
    }),
  ],
).enableRLS();

export const insights = pgTable(
  "insights",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id"),
    periodStart: date("period_start").notNull(),
    periodEnd: date("period_end").notNull(),
    content: text("content").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [
    pgPolicy("own insights", {
      for: "all",
      to: "authenticated",
      using: sql`(select auth.uid()) = ${t.userId}`,
    }),
  ],
).enableRLS();

// Single-row-per-user cache for "Focus for today" — avoids re-generating on
// every dialog open. Valid until it expires (see route) or a newer session
// exists. userId is null until real accounts exist; every query/write is
// scoped by it so this stays correct once they do.
export const focusCache = pgTable(
  "focus_cache",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id"),
    content: text("content").notNull(),
    generatedAt: timestamp("generated_at").defaultNow().notNull(),
    latestSessionAt: timestamp("latest_session_at"),
  },
  (t) => [
    pgPolicy("own focus cache", {
      for: "all",
      to: "authenticated",
      using: sql`(select auth.uid()) = ${t.userId}`,
    }),
  ],
).enableRLS();

// Single-row-per-user cache for the last "Match briefing" generated —
// reopening the page within the TTL shows the same opponent + text right
// away instead of resetting to the picker. Same per-user scoping as above.
export const briefingCache = pgTable(
  "briefing_cache",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id"),
    opponent: text("opponent").notNull(),
    content: text("content").notNull(),
    generatedAt: timestamp("generated_at").defaultNow().notNull(),
  },
  (t) => [
    pgPolicy("own briefing cache", {
      for: "all",
      to: "authenticated",
      using: sql`(select auth.uid()) = ${t.userId}`,
    }),
  ],
).enableRLS();

// One row per Supabase auth user. id is not a Drizzle-managed foreign key
// into auth.users (that schema isn't tracked here) — it's only ever written
// by src/app/auth/callback/route.ts right after a real auth user is created,
// so referential integrity is maintained at the application level.
export const profiles = pgTable(
  "profiles",
  {
    id: uuid("id").primaryKey(),
    language: languageCode("language").notNull().default("en"),
    theme: themeMode("theme").notNull().default("light"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [
    pgPolicy("own profile", {
      for: "all",
      to: "authenticated",
      using: sql`(select auth.uid()) = ${t.id}`,
    }),
  ],
).enableRLS();

export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;

export type Insight = typeof insights.$inferSelect;
export type NewInsight = typeof insights.$inferInsert;

export type FocusCache = typeof focusCache.$inferSelect;
export type NewFocusCache = typeof focusCache.$inferInsert;

export type BriefingCache = typeof briefingCache.$inferSelect;
export type NewBriefingCache = typeof briefingCache.$inferInsert;

export type ThemeMode = (typeof themeMode.enumValues)[number];

export type Profile = typeof profiles.$inferSelect;
export type NewProfile = typeof profiles.$inferInsert;
