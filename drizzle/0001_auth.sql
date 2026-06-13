-- Auth migration: add credentials to users and sessions table.
-- Existing anonymous users cannot log in; truncate or recreate users if needed.

TRUNCATE TABLE "chat_messages", "analyses", "journal_entries", "users" CASCADE;

ALTER TABLE "users" ADD COLUMN "email" text;
ALTER TABLE "users" ADD COLUMN "password_hash" text;
ALTER TABLE "users" ALTER COLUMN "name" DROP NOT NULL;
ALTER TABLE "users" ALTER COLUMN "exam_type" DROP NOT NULL;

ALTER TABLE "users" ALTER COLUMN "email" SET NOT NULL;
ALTER TABLE "users" ALTER COLUMN "password_hash" SET NOT NULL;
ALTER TABLE "users" ADD CONSTRAINT "users_email_unique" UNIQUE("email");

CREATE TABLE IF NOT EXISTS "sessions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE cascade,
  "token_hash" text NOT NULL,
  "expires_at" timestamp with time zone NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "sessions_token_hash_unique" UNIQUE("token_hash")
);

CREATE INDEX IF NOT EXISTS "sessions_user_id_idx" ON "sessions" ("user_id");
CREATE INDEX IF NOT EXISTS "sessions_token_hash_idx" ON "sessions" ("token_hash");
