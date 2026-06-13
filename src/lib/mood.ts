export const MOOD_OPTIONS = [
  { score: 1, labelKey: "journal.moodVeryLow" as const },
  { score: 2, labelKey: "journal.moodLow" as const },
  { score: 3, labelKey: "journal.moodOkay" as const },
  { score: 4, labelKey: "journal.moodGood" as const },
  { score: 5, labelKey: "journal.moodGreat" as const },
] as const;

export const BURNOUT_BADGE_STYLES = {
  low: "border-success/40 bg-success/10 text-success",
  medium: "border-warning/40 bg-warning/10 text-warning",
  high: "border-destructive/40 bg-destructive/10 text-destructive",
} as const;
