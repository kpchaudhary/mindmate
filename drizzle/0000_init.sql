CREATE TYPE "public"."burnout_level" AS ENUM('low', 'medium', 'high');

CREATE TABLE IF NOT EXISTS "users" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "name" text NOT NULL,
  "exam_type" text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "journal_entries" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE cascade,
  "content" text NOT NULL,
  "mood_score" integer NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "analyses" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "entry_id" uuid NOT NULL REFERENCES "journal_entries"("id") ON DELETE cascade,
  "mood" text NOT NULL,
  "emotions" jsonb NOT NULL,
  "triggers" jsonb NOT NULL,
  "coping_strategy" text NOT NULL,
  "motivation" text NOT NULL,
  "recommendation" text NOT NULL,
  "burnout_level" "burnout_level" NOT NULL,
  "burnout_reasoning" text NOT NULL,
  "risk_flag" boolean DEFAULT false NOT NULL,
  "raw" jsonb,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "chat_messages" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE cascade,
  "role" text NOT NULL,
  "content" text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "journal_entries_user_id_idx" ON "journal_entries" ("user_id");
CREATE INDEX IF NOT EXISTS "analyses_entry_id_idx" ON "analyses" ("entry_id");
CREATE INDEX IF NOT EXISTS "chat_messages_user_id_idx" ON "chat_messages" ("user_id");
