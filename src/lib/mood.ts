export const MOOD_OPTIONS = [
  { score: 1, emoji: "😔", labelKey: "journal.moodVeryLow" as const },
  { score: 2, emoji: "😕", labelKey: "journal.moodLow" as const },
  { score: 3, emoji: "😐", labelKey: "journal.moodOkay" as const },
  { score: 4, emoji: "🙂", labelKey: "journal.moodGood" as const },
  { score: 5, emoji: "😊", labelKey: "journal.moodGreat" as const },
] as const;

export function getMoodEmoji(score: number): string {
  return MOOD_OPTIONS.find((m) => m.score === score)?.emoji ?? "😐";
}

export const BURNOUT_BADGE_STYLES = {
  low: "border-success/40 bg-success/10 text-success",
  medium: "border-warning/40 bg-warning/10 text-warning",
  high: "border-destructive/40 bg-destructive/10 text-destructive",
} as const;
