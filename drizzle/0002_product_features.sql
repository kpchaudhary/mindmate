-- Safe additive migration for product features.
-- Run with: npm run db:migrate:features
-- Do NOT use `npm run db:push` on an existing database — it may try to
-- drop __drizzle_migrations and alter primary keys.

-- users: optional exam date
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "exam_date" timestamp with time zone;

-- users: streak tracking
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "streak_count" integer;
UPDATE "users" SET "streak_count" = 0 WHERE "streak_count" IS NULL;
ALTER TABLE "users" ALTER COLUMN "streak_count" SET DEFAULT 0;
DO $$ BEGIN
  ALTER TABLE "users" ALTER COLUMN "streak_count" SET NOT NULL;
EXCEPTION WHEN others THEN NULL;
END $$;

ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "last_journal_date" timestamp with time zone;

-- users: daily reminder
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "reminder_enabled" boolean;
UPDATE "users" SET "reminder_enabled" = false WHERE "reminder_enabled" IS NULL;
ALTER TABLE "users" ALTER COLUMN "reminder_enabled" SET DEFAULT false;
DO $$ BEGIN
  ALTER TABLE "users" ALTER COLUMN "reminder_enabled" SET NOT NULL;
EXCEPTION WHEN others THEN NULL;
END $$;

ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "reminder_time" text;

-- users: language preference
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "language" text;
UPDATE "users" SET "language" = 'en' WHERE "language" IS NULL;
ALTER TABLE "users" ALTER COLUMN "language" SET DEFAULT 'en';
DO $$ BEGIN
  ALTER TABLE "users" ALTER COLUMN "language" SET NOT NULL;
EXCEPTION WHEN others THEN NULL;
END $$;

-- journal_entries: optional mock test score
ALTER TABLE "journal_entries" ADD COLUMN IF NOT EXISTS "mock_score" integer;
