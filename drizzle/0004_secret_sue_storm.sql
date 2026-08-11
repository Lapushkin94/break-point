CREATE TABLE "briefing_cache" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"opponent" text NOT NULL,
	"content" text NOT NULL,
	"generated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "focus_cache" ADD COLUMN "user_id" uuid;