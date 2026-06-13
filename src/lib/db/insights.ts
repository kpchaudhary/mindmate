export const STRESS_TRIGGERS = [
  "exam anxiety",
  "family pressure",
  "social comparison",
  "burnout",
  "sleep issues",
  "confidence issues",
] as const;

export type StressTrigger = (typeof STRESS_TRIGGERS)[number];

type TriggerRow = {
  triggers: string[] | null;
};

type InsightEntry = {
  createdAt: Date;
  moodScore: number;
  mood: string | null;
  burnoutLevel: string | null;
  triggers: string[] | null;
  emotions?: string[] | null;
};

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

function averageMood(entries: InsightEntry[]): number | null {
  if (entries.length === 0) return null;
  const sum = entries.reduce((acc, e) => acc + e.moodScore, 0);
  return Math.round((sum / entries.length) * 10) / 10;
}

export function buildMoodInsights(entries: InsightEntry[]) {
  const now = new Date();
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const fourteenDaysAgo = new Date(now);
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

  const recentWeek = entries.filter((e) => e.createdAt >= sevenDaysAgo);
  const priorWeek = entries.filter(
    (e) => e.createdAt >= fourteenDaysAgo && e.createdAt < sevenDaysAgo
  );

  const recentAvg = averageMood(recentWeek);
  const priorAvg = averageMood(priorWeek);
  const delta =
    recentAvg !== null && priorAvg !== null
      ? Math.round((recentAvg - priorAvg) * 10) / 10
      : null;

  let direction: "improving" | "stable" | "declining" = "stable";
  if (delta !== null) {
    if (delta >= 0.3) direction = "improving";
    else if (delta <= -0.3) direction = "declining";
  }

  const byDayBuckets: Record<number, { total: number; count: number }> = {};
  for (let i = 0; i < 7; i++) {
    byDayBuckets[i] = { total: 0, count: 0 };
  }
  for (const entry of entries) {
    const day = entry.createdAt.getDay();
    byDayBuckets[day].total += entry.moodScore;
    byDayBuckets[day].count += 1;
  }

  const byDayOfWeek = DAY_LABELS.map((label, index) => ({
    day: label,
    average:
      byDayBuckets[index].count > 0
        ? Math.round((byDayBuckets[index].total / byDayBuckets[index].count) * 10) / 10
        : null,
  }));

  const emotionCounts: Record<string, number> = {};
  for (const entry of entries) {
    for (const emotion of entry.emotions ?? []) {
      const key = emotion.trim();
      if (key) emotionCounts[key] = (emotionCounts[key] ?? 0) + 1;
    }
  }

  const topEmotions = Object.entries(emotionCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([emotion, count]) => ({ emotion, count }));

  const lowBurnout = entries.filter((e) => e.burnoutLevel === "low");
  const highBurnout = entries.filter((e) => e.burnoutLevel === "high");

  const moodBurnoutCorrelation = {
    lowBurnoutAvg: averageMood(lowBurnout),
    highBurnoutAvg: averageMood(highBurnout),
  };

  let lowMoodStreak = 0;
  for (const entry of entries) {
    if (entry.moodScore <= 2) lowMoodStreak += 1;
    else break;
  }

  return {
    weeklyAverage: recentAvg,
    priorWeeklyAverage: priorAvg,
    delta,
    direction,
    byDayOfWeek,
    topEmotions,
    moodBurnoutCorrelation,
    lowMoodStreak,
  };
}

export function computeTriggerFrequency(
  rows: TriggerRow[],
  stressTriggers: readonly string[] = STRESS_TRIGGERS
): Record<string, number> {
  const frequency: Record<string, number> = {};
  for (const trigger of stressTriggers) {
    frequency[trigger] = 0;
  }

  for (const row of rows) {
    const triggerList = row.triggers ?? [];
    for (const trigger of triggerList) {
      const normalized = trigger.toLowerCase();
      const match = stressTriggers.find((t) => normalized.includes(t));
      if (match) {
        frequency[match] += 1;
      }
    }
  }

  return frequency;
}

export function buildMoodTimeline(entries: InsightEntry[]) {
  return entries
    .slice()
    .reverse()
    .map((entry) => ({
      date: entry.createdAt.toISOString().slice(0, 10),
      moodScore: entry.moodScore,
      mood: entry.mood,
      burnoutLevel: entry.burnoutLevel,
    }));
}

export function buildConfidenceTrend(entries: InsightEntry[]) {
  return entries
    .slice(0, 7)
    .map((entry) => {
      const hasConfidenceIssue = (entry.triggers ?? []).some((t) =>
        t.toLowerCase().includes("confidence")
      );
      return {
        date: entry.createdAt.toISOString().slice(0, 10),
        confidence: hasConfidenceIssue ? 1 : 5 - entry.moodScore + 1,
      };
    })
    .reverse();
}

export function pickTopTrigger(
  frequency: Record<string, number>
): { name: string; count: number } | null {
  const topTrigger = Object.entries(frequency).sort((a, b) => b[1] - a[1])[0];
  return topTrigger ? { name: topTrigger[0], count: topTrigger[1] } : null;
}
