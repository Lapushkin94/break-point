CREATE TYPE "public"."theme_mode" AS ENUM('light', 'dark');--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "theme" "theme_mode" DEFAULT 'light' NOT NULL;