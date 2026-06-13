import { eq, desc } from "drizzle-orm";
import { getDb } from "./index";
import {
  buildConfidenceTrend,
  buildMoodTimeline,
  computeTriggerFrequency,
  pickTopTrigger,
} from "./insights";
import {
  users,
  sessions,
  journalEntries,
  analyses,
  chatMessages,
  type ExamType,
} from "./schema";

export { STRESS_TRIGGERS } from "./insights";
export type { StressTrigger } from "./insights";

export async function createUserWithCredentials(email: string, passwordHash: string) {
  const [user] = await getDb()
    .insert(users)
    .values({ email, passwordHash })
    .returning();
  return user;
}

export async function getUserByEmail(email: string) {
  const [user] = await getDb()
    .select()
    .from(users)
    .where(eq(users.email, email.toLowerCase()))
    .limit(1);
  return user ?? null;
}

export async function createSession(userId: string, tokenHash: string, expiresAt: Date) {
  const [session] = await getDb()
    .insert(sessions)
    .values({ userId, tokenHash, expiresAt })
    .returning();
  return session;
}

export async function getSessionByTokenHash(tokenHash: string) {
  const [row] = await getDb()
    .select({
      sessionId: sessions.id,
      userId: users.id,
      email: users.email,
      name: users.name,
      examType: users.examType,
      examDate: users.examDate,
      streakCount: users.streakCount,
      reminderEnabled: users.reminderEnabled,
      reminderTime: users.reminderTime,
      language: users.language,
      avatarUrl: users.avatarUrl,
      expiresAt: sessions.expiresAt,
    })
    .from(sessions)
    .innerJoin(users, eq(users.id, sessions.userId))
    .where(eq(sessions.tokenHash, tokenHash))
    .limit(1);
  return row ?? null;
}

export async function deleteSession(tokenHash: string) {
  await getDb().delete(sessions).where(eq(sessions.tokenHash, tokenHash));
}

export async function deleteSessionsForUser(userId: string) {
  await getDb().delete(sessions).where(eq(sessions.userId, userId));
}

export async function getUserById(userId: string) {
  const [user] = await getDb().select().from(users).where(eq(users.id, userId)).limit(1);
  return user ?? null;
}

export async function updateUser(
  userId: string,
  data: {
    name?: string;
    examType?: ExamType;
    examDate?: Date | null;
    avatarUrl?: string | null;
    reminderEnabled?: boolean;
    reminderTime?: string | null;
    language?: "en" | "hi";
  }
) {
  const [user] = await getDb()
    .update(users)
    .set({
      ...(data.name !== undefined && { name: data.name }),
      ...(data.examType !== undefined && { examType: data.examType }),
      ...(data.examDate !== undefined && { examDate: data.examDate }),
      ...(data.avatarUrl !== undefined && { avatarUrl: data.avatarUrl }),
      ...(data.reminderEnabled !== undefined && { reminderEnabled: data.reminderEnabled }),
      ...(data.reminderTime !== undefined && { reminderTime: data.reminderTime }),
      ...(data.language !== undefined && { language: data.language }),
    })
    .where(eq(users.id, userId))
    .returning();
  return user;
}

export async function updateUserPassword(userId: string, passwordHash: string) {
  const [user] = await getDb()
    .update(users)
    .set({ passwordHash })
    .where(eq(users.id, userId))
    .returning();
  return user;
}

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function updateStreakOnJournal(userId: string) {
  const user = await getUserById(userId);
  if (!user) return 0;

  const today = startOfDay(new Date());
  const lastDate = user.lastJournalDate ? startOfDay(user.lastJournalDate) : null;

  let newStreak = user.streakCount;
  if (!lastDate) {
    newStreak = 1;
  } else {
    const diffDays = Math.round((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) {
      newStreak = user.streakCount;
    } else if (diffDays === 1) {
      newStreak = user.streakCount + 1;
    } else {
      newStreak = 1;
    }
  }

  await getDb()
    .update(users)
    .set({ streakCount: newStreak, lastJournalDate: new Date() })
    .where(eq(users.id, userId));

  return newStreak;
}

export async function createJournalWithAnalysis(input: {
  userId: string;
  content: string;
  moodScore: number;
  mockScore?: number | null;
  analysis: {
    mood: string;
    emotions: string[];
    triggers: string[];
    copingStrategy: string;
    motivation: string;
    recommendation: string;
    burnoutLevel: "low" | "medium" | "high";
    burnoutReasoning: string;
    riskFlag: boolean;
    raw?: Record<string, unknown>;
  };
}) {
  const [entry] = await getDb()
    .insert(journalEntries)
    .values({
      userId: input.userId,
      content: input.content,
      moodScore: input.moodScore,
      mockScore: input.mockScore ?? null,
    })
    .returning();

  const [analysis] = await getDb()
    .insert(analyses)
    .values({
      entryId: entry.id,
      mood: input.analysis.mood,
      emotions: input.analysis.emotions,
      triggers: input.analysis.triggers,
      copingStrategy: input.analysis.copingStrategy,
      motivation: input.analysis.motivation,
      recommendation: input.analysis.recommendation,
      burnoutLevel: input.analysis.burnoutLevel,
      burnoutReasoning: input.analysis.burnoutReasoning,
      riskFlag: input.analysis.riskFlag,
      raw: input.analysis.raw,
    })
    .returning();

  return { entry, analysis };
}

export async function getRecentJournalContext(userId: string, limit = 5) {
  const rows = await getDb()
    .select({
      content: journalEntries.content,
      moodScore: journalEntries.moodScore,
      createdAt: journalEntries.createdAt,
      mood: analyses.mood,
      triggers: analyses.triggers,
      burnoutLevel: analyses.burnoutLevel,
    })
    .from(journalEntries)
    .leftJoin(analyses, eq(analyses.entryId, journalEntries.id))
    .where(eq(journalEntries.userId, userId))
    .orderBy(desc(journalEntries.createdAt))
    .limit(limit);

  return rows;
}

export async function getTriggerFrequency(userId: string) {
  const rows = await getDb()
    .select({
      triggers: analyses.triggers,
    })
    .from(analyses)
    .innerJoin(journalEntries, eq(journalEntries.id, analyses.entryId))
    .where(eq(journalEntries.userId, userId));

  return computeTriggerFrequency(
    rows.map((row) => ({ triggers: (row.triggers as string[]) ?? null }))
  );
}

export async function getInsightsData(userId: string) {
  const entries = await getDb()
    .select({
      id: journalEntries.id,
      content: journalEntries.content,
      moodScore: journalEntries.moodScore,
      mockScore: journalEntries.mockScore,
      createdAt: journalEntries.createdAt,
      mood: analyses.mood,
      emotions: analyses.emotions,
      triggers: analyses.triggers,
      burnoutLevel: analyses.burnoutLevel,
      burnoutReasoning: analyses.burnoutReasoning,
      recommendation: analyses.recommendation,
      riskFlag: analyses.riskFlag,
    })
    .from(journalEntries)
    .innerJoin(analyses, eq(analyses.entryId, journalEntries.id))
    .where(eq(journalEntries.userId, userId))
    .orderBy(desc(journalEntries.createdAt));

  const triggerFrequency = await getTriggerFrequency(userId);

  const moodTimeline = buildMoodTimeline(
    entries.map((entry) => ({
      createdAt: entry.createdAt,
      moodScore: entry.moodScore,
      mood: entry.mood,
      burnoutLevel: entry.burnoutLevel,
      triggers: (entry.triggers as string[]) ?? null,
    }))
  );

  const burnoutTrend = entries
    .slice()
    .reverse()
    .slice(-14)
    .map((entry) => ({
      date: entry.createdAt.toISOString().slice(0, 10),
      burnoutScore:
        entry.burnoutLevel === "high" ? 3 : entry.burnoutLevel === "medium" ? 2 : 1,
      burnoutLevel: entry.burnoutLevel,
    }));

  const mockScoreCorrelation = entries
    .filter((e) => e.mockScore != null)
    .slice()
    .reverse()
    .map((entry) => ({
      date: entry.createdAt.toISOString().slice(0, 10),
      mockScore: entry.mockScore as number,
      moodScore: entry.moodScore,
    }));

  const topTrigger = pickTopTrigger(triggerFrequency);

  const recentBurnout = entries[0]?.burnoutLevel ?? "low";

  const confidenceTrend = buildConfidenceTrend(
    entries.map((entry) => ({
      createdAt: entry.createdAt,
      moodScore: entry.moodScore,
      mood: entry.mood,
      burnoutLevel: entry.burnoutLevel,
      triggers: (entry.triggers as string[]) ?? null,
    }))
  );

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recentWeekEntries = entries.filter((e) => e.createdAt >= sevenDaysAgo);

  return {
    entries,
    triggerFrequency,
    moodTimeline,
    burnoutTrend,
    mockScoreCorrelation,
    topTrigger,
    recentBurnout,
    confidenceTrend,
    totalEntries: entries.length,
    recentWeekEntries,
  };
}

export async function getChatHistory(userId: string, limit = 20) {
  return getDb()
    .select()
    .from(chatMessages)
    .where(eq(chatMessages.userId, userId))
    .orderBy(desc(chatMessages.createdAt))
    .limit(limit)
    .then((rows) => rows.reverse());
}

export async function saveChatMessage(
  userId: string,
  role: "user" | "assistant",
  content: string
) {
  const [message] = await getDb()
    .insert(chatMessages)
    .values({ userId, role, content })
    .returning();
  return message;
}

export async function getLatestAnalysisSummary(userId: string) {
  const [row] = await getDb()
    .select({
      mood: analyses.mood,
      triggers: analyses.triggers,
      burnoutLevel: analyses.burnoutLevel,
      recommendation: analyses.recommendation,
    })
    .from(analyses)
    .innerJoin(journalEntries, eq(journalEntries.id, analyses.entryId))
    .where(eq(journalEntries.userId, userId))
    .orderBy(desc(analyses.createdAt))
    .limit(1);

  return row ?? null;
}

export async function getJournalEntriesForUser(userId: string, limit = 50) {
  return getDb()
    .select({
      id: journalEntries.id,
      content: journalEntries.content,
      moodScore: journalEntries.moodScore,
      mockScore: journalEntries.mockScore,
      createdAt: journalEntries.createdAt,
      mood: analyses.mood,
      emotions: analyses.emotions,
      triggers: analyses.triggers,
      copingStrategy: analyses.copingStrategy,
      motivation: analyses.motivation,
      recommendation: analyses.recommendation,
      burnoutLevel: analyses.burnoutLevel,
      burnoutReasoning: analyses.burnoutReasoning,
      riskFlag: analyses.riskFlag,
    })
    .from(journalEntries)
    .innerJoin(analyses, eq(analyses.entryId, journalEntries.id))
    .where(eq(journalEntries.userId, userId))
    .orderBy(desc(journalEntries.createdAt))
    .limit(limit);
}
