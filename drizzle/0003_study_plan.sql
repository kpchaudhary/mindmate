-- Safe additive migration for study plan feature.
-- Run with: npm run db:migrate:features

DO $$ BEGIN
  CREATE TYPE "study_plan_status" AS ENUM('active', 'archived');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "study_plan_item_status" AS ENUM('pending', 'done');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "study_plans" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "title" text NOT NULL,
  "week_start" timestamp with time zone NOT NULL,
  "ai_rationale" text NOT NULL,
  "status" "study_plan_status" DEFAULT 'active' NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "study_plan_items" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "plan_id" uuid NOT NULL REFERENCES "study_plans"("id") ON DELETE CASCADE,
  "subject" text NOT NULL,
  "topic" text NOT NULL,
  "description" text NOT NULL,
  "duration_minutes" integer NOT NULL,
  "scheduled_date" timestamp with time zone NOT NULL,
  "status" "study_plan_item_status" DEFAULT 'pending' NOT NULL,
  "sort_order" integer DEFAULT 0 NOT NULL,
  "is_user_edited" boolean DEFAULT false NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "study_plans_user_id_idx" ON "study_plans" ("user_id");
CREATE INDEX IF NOT EXISTS "study_plan_items_plan_id_idx" ON "study_plan_items" ("plan_id");
