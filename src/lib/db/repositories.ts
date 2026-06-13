import { eq, desc } from "drizzle-orm";
import { getDb } from "./index";
import {
  users,
  journalEntries,
  analyses,
  chatMessages,
  type ExamType,
} from "./schema";

export const STRESS_TRIGGERS = [
  "exam anxiety",
  "family pressure",
  "social comparison",
  "burnout",
  "sleep issues",
  "confidence issues",
] as const;

export type StressTrigger = (typeof STRESS_TRIGGERS)[number];

export async function createUser(name: string, examType: ExamType) {
  const [user] = await getDb()
    .insert(users)
    .values({ name, examType })
    .returning();
  return user;
}

export async function getUserById(userId: string) {
  const [user] = await getDb().select().from(users).where(eq(users.id, userId)).limit(1);
  return user ?? null;
}

export async function updateUser(
  userId: string,
  data: { name: string; examType: ExamType }
) {
  const [user] = await getDb()
    .update(users)
    .set({ name: data.name, examType: data.examType })
    .where(eq(users.id, userId))
    .returning();
  return user;
}

export async function createJournalWithAnalysis(input: {
  userId: string;
  content: string;
  moodScore: number;
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

  const frequency: Record<string, number> = {};
  for (const trigger of STRESS_TRIGGERS) {
    frequency[trigger] = 0;
  }

  for (const row of rows) {
    const triggerList = (row.triggers as string[]) ?? [];
    for (const trigger of triggerList) {
      const normalized = trigger.toLowerCase();
      const match = STRESS_TRIGGERS.find((t) => normalized.includes(t));
      if (match) {
        frequency[match] += 1;
      }
    }
  }

  return frequency;
}

export async function getInsightsData(userId: string) {
  const entries = await getDb()
    .select({
      id: journalEntries.id,
      content: journalEntries.content,
      moodScore: journalEntries.moodScore,
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

  const moodTimeline = entries
    .slice()
    .reverse()
    .map((entry) => ({
      date: entry.createdAt.toISOString().slice(0, 10),
      moodScore: entry.moodScore,
      mood: entry.mood,
      burnoutLevel: entry.burnoutLevel,
    }));

  const topTrigger = Object.entries(triggerFrequency).sort((a, b) => b[1] - a[1])[0];

  const recentBurnout = entries[0]?.burnoutLevel ?? "low";

  const confidenceTrend = entries.slice(0, 7).map((entry) => {
    const hasConfidenceIssue = ((entry.triggers as string[]) ?? []).some((t) =>
      t.toLowerCase().includes("confidence")
    );
    return {
      date: entry.createdAt.toISOString().slice(0, 10),
      confidence: hasConfidenceIssue ? 1 : 5 - entry.moodScore + 1,
    };
  });

  return {
    entries,
    triggerFrequency,
    moodTimeline,
    topTrigger: topTrigger ? { name: topTrigger[0], count: topTrigger[1] } : null,
    recentBurnout,
    confidenceTrend: confidenceTrend.reverse(),
    totalEntries: entries.length,
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
