DO $$ BEGIN
 CREATE TYPE "public"."provider" AS ENUM('google', 'github');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"pwd" text,
	"provider" "provider" NOT NULL,
	"p_id" text NOT NULL,
	"email" text,
	"pfp" text
);
