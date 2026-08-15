CREATE TABLE "opponents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"name" text NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "opponents" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "sessions" ADD COLUMN "opponent_id" uuid;--> statement-breakpoint
CREATE POLICY "own opponents" ON "opponents" AS PERMISSIVE FOR ALL TO "authenticated" USING ((select auth.uid()) = "opponents"."user_id");