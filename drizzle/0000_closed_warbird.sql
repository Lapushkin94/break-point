CREATE TYPE "public"."match_result" AS ENUM('win', 'loss');--> statement-breakpoint
CREATE TYPE "public"."session_type" AS ENUM('training', 'match', 'rally');--> statement-breakpoint
CREATE TYPE "public"."surface_type" AS ENUM('hard', 'clay', 'carpet');--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" "session_type" NOT NULL,
	"date" date NOT NULL,
	"opponent" text,
	"score" text,
	"result" "match_result",
	"surface" "surface_type",
	"duration_minutes" integer,
	"energy" integer,
	"mood" integer,
	"raw_text" text NOT NULL,
	"what_worked" jsonb DEFAULT '[]'::jsonb,
	"what_failed" jsonb DEFAULT '[]'::jsonb,
	"coach_notes" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
