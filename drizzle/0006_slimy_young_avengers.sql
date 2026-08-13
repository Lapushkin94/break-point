CREATE TYPE "public"."language_code" AS ENUM('en', 'ru', 'el');--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY NOT NULL,
	"language" "language_code" DEFAULT 'en' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "profiles" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "briefing_cache" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "focus_cache" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "insights" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "sessions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE POLICY "own briefing cache" ON "briefing_cache" AS PERMISSIVE FOR ALL TO "authenticated" USING ((select auth.uid()) = "briefing_cache"."user_id");--> statement-breakpoint
CREATE POLICY "own focus cache" ON "focus_cache" AS PERMISSIVE FOR ALL TO "authenticated" USING ((select auth.uid()) = "focus_cache"."user_id");--> statement-breakpoint
CREATE POLICY "own insights" ON "insights" AS PERMISSIVE FOR ALL TO "authenticated" USING ((select auth.uid()) = "insights"."user_id");--> statement-breakpoint
CREATE POLICY "own sessions" ON "sessions" AS PERMISSIVE FOR ALL TO "authenticated" USING ((select auth.uid()) = "sessions"."user_id");--> statement-breakpoint
CREATE POLICY "own profile" ON "profiles" AS PERMISSIVE FOR ALL TO "authenticated" USING ((select auth.uid()) = "profiles"."id");