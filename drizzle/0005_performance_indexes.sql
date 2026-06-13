-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS "journal_entries_user_id_created_at_idx"
  ON "journal_entries" ("user_id", "created_at" DESC);

CREATE INDEX IF NOT EXISTS "chat_messages_user_id_created_at_idx"
  ON "chat_messages" ("user_id", "created_at" DESC);

CREATE INDEX IF NOT EXISTS "study_plans_user_id_status_idx"
  ON "study_plans" ("user_id", "status");
