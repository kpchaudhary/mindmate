import { pgTable, uuid, text, timestamp, integer, boolean, jsonb, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const examTypes = [
  "NEET",
  "JEE",
  "CUET",
  "CAT",
  "GATE",
  "UPSC",
] as const;

export type ExamType = (typeof examTypes)[number];

export const burnoutLevelEnum = pgEnum("burnout_level", ["low", "medium", "high"]);

export const studyPlanStatusEnum = pgEnum("study_plan_status", ["active", "archived"]);

export const studyPlanItemStatusEnum = pgEnum("study_plan_item_status", ["pending", "done"]);

export const languages = ["en", "hi"] as const;
export type Language = (typeof languages)[number];

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name"),
  examType: text("exam_type"),
  examDate: timestamp("exam_date", { withTimezone: true }),
  streakCount: integer("streak_count").default(0).notNull(),
  lastJournalDate: timestamp("last_journal_date", { withTimezone: true }),
  reminderEnabled: boolean("reminder_enabled").default(false).notNull(),
  reminderTime: text("reminder_time"),
  language: text("language").default("en").notNull(),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const sessions = pgTable("sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  tokenHash: text("token_hash").notNull().unique(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const journalEntries = pgTable("journal_entries", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  moodScore: integer("mood_score").notNull(),
  mockScore: integer("mock_score"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const analyses = pgTable("analyses", {
  id: uuid("id").defaultRandom().primaryKey(),
  entryId: uuid("entry_id")
    .notNull()
    .references(() => journalEntries.id, { onDelete: "cascade" }),
  mood: text("mood").notNull(),
  emotions: jsonb("emotions").$type<string[]>().notNull(),
  triggers: jsonb("triggers").$type<string[]>().notNull(),
  copingStrategy: text("coping_strategy").notNull(),
  motivation: text("motivation").notNull(),
  recommendation: text("recommendation").notNull(),
  burnoutLevel: burnoutLevelEnum("burnout_level").notNull(),
  burnoutReasoning: text("burnout_reasoning").notNull(),
  riskFlag: boolean("risk_flag").default(false).notNull(),
  raw: jsonb("raw").$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const studyPlans = pgTable("study_plans", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  weekStart: timestamp("week_start", { withTimezone: true }).notNull(),
  aiRationale: text("ai_rationale").notNull(),
  status: studyPlanStatusEnum("status").default("active").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const studyPlanItems = pgTable("study_plan_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  planId: uuid("plan_id")
    .notNull()
    .references(() => studyPlans.id, { onDelete: "cascade" }),
  subject: text("subject").notNull(),
  topic: text("topic").notNull(),
  description: text("description").notNull(),
  durationMinutes: integer("duration_minutes").notNull(),
  scheduledDate: timestamp("scheduled_date", { withTimezone: true }).notNull(),
  status: studyPlanItemStatusEnum("status").default("pending").notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  isUserEdited: boolean("is_user_edited").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const chatMessages = pgTable("chat_messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  role: text("role").$type<"user" | "assistant">().notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  journalEntries: many(journalEntries),
  chatMessages: many(chatMessages),
  sessions: many(sessions),
  studyPlans: many(studyPlans),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const journalEntriesRelations = relations(journalEntries, ({ one }) => ({
  user: one(users, {
    fields: [journalEntries.userId],
    references: [users.id],
  }),
  analysis: one(analyses, {
    fields: [journalEntries.id],
    references: [analyses.entryId],
  }),
}));

export const analysesRelations = relations(analyses, ({ one }) => ({
  entry: one(journalEntries, {
    fields: [analyses.entryId],
    references: [journalEntries.id],
  }),
}));

export const studyPlansRelations = relations(studyPlans, ({ one, many }) => ({
  user: one(users, {
    fields: [studyPlans.userId],
    references: [users.id],
  }),
  items: many(studyPlanItems),
}));

export const studyPlanItemsRelations = relations(studyPlanItems, ({ one }) => ({
  plan: one(studyPlans, {
    fields: [studyPlanItems.planId],
    references: [studyPlans.id],
  }),
}));

export type User = typeof users.$inferSelect;
export type JournalEntry = typeof journalEntries.$inferSelect;
export type Analysis = typeof analyses.$inferSelect;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type StudyPlan = typeof studyPlans.$inferSelect;
export type StudyPlanItem = typeof studyPlanItems.$inferSelect;
