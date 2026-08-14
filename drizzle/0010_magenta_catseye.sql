ALTER TYPE "public"."theme_mode" RENAME VALUE 'light' TO 'carpet';--> statement-breakpoint
ALTER TYPE "public"."theme_mode" RENAME VALUE 'dark' TO 'clay';--> statement-breakpoint
ALTER TYPE "public"."theme_mode" ADD VALUE 'hard';--> statement-breakpoint
ALTER TABLE "profiles" ALTER COLUMN "theme" SET DEFAULT 'carpet'::"public"."theme_mode";
