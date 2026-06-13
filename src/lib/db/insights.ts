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
};

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
