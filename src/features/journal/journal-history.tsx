"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, BookOpen, ChevronRight, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/error-state";
import { InsightCard, type InsightData } from "@/features/journal/insight-card";
import { MoodIcon } from "@/components/ui/mood-icon";
import { BURNOUT_BADGE_STYLES, MOOD_OPTIONS } from "@/lib/mood";
import { formatDate, formatDateLabel, formatRelativeTime } from "@/lib/format-date";
import { useLanguage } from "@/lib/i18n/language-context";
import type { TranslationKey } from "@/lib/i18n/translations";
import { cn } from "@/lib/utils";

export type JournalEntryItem = {
  id: string;
  content: string;
  moodScore: number;
  createdAt: string;
  analysis: InsightData;
};

type JournalHistoryProps = {
  refreshKey?: number;
};

const BURNOUT_BORDER_STYLES = {
  low: "border-l-success/70",
  medium: "border-l-warning/70",
  high: "border-l-destructive/70",
} as const;

const BURNOUT_LABEL_KEYS: Record<InsightData["burnoutLevel"], TranslationKey> = {
  low: "journal.burnoutLow",
  medium: "journal.burnoutMedium",
  high: "journal.burnoutHigh",
};

function getMoodLabel(score: number, t: (key: TranslationKey) => string) {
  const mood = MOOD_OPTIONS.find((m) => m.score === score) ?? MOOD_OPTIONS[2];
  return t(mood.labelKey);
}

function EntryListItem({
  entry,
  onSelect,
  t,
}: {
  entry: JournalEntryItem;
  onSelect: () => void;
  t: (key: TranslationKey) => string;
}) {
  const moodLabel = getMoodLabel(entry.moodScore, t);
  const burnoutLabel = t(BURNOUT_LABEL_KEYS[entry.analysis.burnoutLevel]);

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "group flex w-full items-start gap-3 rounded-lg border border-l-[3px] p-3 text-left transition-all",
        "hover:border-primary/30 hover:bg-accent/40 hover:shadow-sm",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        BURNOUT_BORDER_STYLES[entry.analysis.burnoutLevel]
      )}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 ring-1 ring-primary/15">
        <MoodIcon score={entry.moodScore} className="h-6 w-6" />
      </div>

      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="text-xs font-medium text-foreground">
            {formatRelativeTime(entry.createdAt)}
          </span>
          <span className="text-xs text-muted-foreground" aria-hidden="true">
            ·
          </span>
          <span className="text-xs text-muted-foreground">{formatDate(entry.createdAt)}</span>
          {entry.analysis.riskFlag && (
            <Badge
              variant="outline"
              className="gap-1 border-destructive/40 bg-destructive/10 text-destructive"
            >
              <AlertTriangle className="h-3 w-3" aria-hidden="true" />
              {t("journal.riskAlert")}
            </Badge>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-primary">
            {moodLabel} ({entry.moodScore}/5)
          </span>
          <Badge
            variant="outline"
            className={cn("text-[10px] capitalize", BURNOUT_BADGE_STYLES[entry.analysis.burnoutLevel])}
          >
            {burnoutLabel}
          </Badge>
        </div>

        <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground group-hover:text-foreground/80">
          {entry.content}
        </p>
      </div>

      <ChevronRight
        className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
        aria-hidden="true"
      />
    </button>
  );
}

function EntryDetailSheet({
  entry,
  onClose,
  t,
}: {
  entry: JournalEntryItem | null;
  onClose: () => void;
  t: (key: TranslationKey) => string;
}) {
  if (!entry) return null;

  const moodLabel = getMoodLabel(entry.moodScore, t);
  const burnoutLabel = t(BURNOUT_LABEL_KEYS[entry.analysis.burnoutLevel]);

  return (
    <Sheet open onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="flex w-full flex-col gap-0 overflow-y-auto p-0 sm:max-w-xl">
        <div className="bg-gradient-purple px-6 pb-5 pt-6 text-primary-foreground">
          <SheetHeader className="space-y-3 pr-8 text-left">
            <SheetTitle className="flex items-start gap-3 text-primary-foreground">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/20">
                <MoodIcon score={entry.moodScore} className="h-7 w-7" />
              </div>
              <div className="min-w-0 space-y-1">
                <span className="block text-lg font-semibold leading-tight">
                  {formatDateLabel(entry.createdAt)}
                </span>
                <span className="block text-sm font-normal opacity-90">
                  {formatDate(entry.createdAt, "long")}
                </span>
              </div>
            </SheetTitle>
            <SheetDescription className="flex flex-wrap items-center gap-2 text-primary-foreground/90">
              <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-xs font-medium">
                {moodLabel} · {entry.moodScore}/5
              </span>
              <Badge
                variant="outline"
                className={cn(
                  "border-white/30 bg-white/10 text-primary-foreground capitalize",
                  entry.analysis.burnoutLevel === "low" && "border-success/50 bg-success/20",
                  entry.analysis.burnoutLevel === "medium" && "border-warning/50 bg-warning/20",
                  entry.analysis.burnoutLevel === "high" && "border-destructive/50 bg-destructive/20"
                )}
              >
                {burnoutLabel}
              </Badge>
              {entry.analysis.riskFlag && (
                <Badge
                  variant="outline"
                  className="gap-1 border-white/30 bg-destructive/30 text-primary-foreground"
                >
                  <AlertTriangle className="h-3 w-3" aria-hidden="true" />
                  {t("journal.riskAlert")}
                </Badge>
              )}
            </SheetDescription>
          </SheetHeader>
        </div>

        <div className="space-y-6 p-6">
          <section className="space-y-3">
            <h3 className="flex items-center gap-2 text-sm font-medium">
              <BookOpen className="h-4 w-4 text-primary" aria-hidden="true" />
              {t("journal.yourEntry")}
            </h3>
            <div className="rounded-xl border bg-accent/20 p-4 shadow-sm">
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
                {entry.content}
              </p>
            </div>
          </section>

          <div className="flex items-center gap-3">
            <Separator className="flex-1" />
            <span className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              {t("journal.entryInsight")}
            </span>
            <Separator className="flex-1" />
          </div>

          <InsightCard insight={entry.analysis} heading={t("journal.entryInsight")} />
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function JournalHistory({ refreshKey = 0 }: JournalHistoryProps) {
  const { t } = useLanguage();
  const [entries, setEntries] = useState<JournalEntryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selected, setSelected] = useState<JournalEntryItem | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const response = await fetch("/api/journal");
      if (!response.ok) throw new Error("Failed");
      const data = (await response.json()) as { entries: JournalEntryItem[] };
      setEntries(data.entries);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load, refreshKey]);

  const entryCountLabel =
    entries.length === 1
      ? t("journal.oneEntry")
      : t("journal.entryCount").replace("{count}", String(entries.length));

  if (loading) {
    return (
      <Card className="corners min-w-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-primary" aria-hidden="true" />
            {t("journal.pastEntries")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3 rounded-lg border p-3">
              <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <ErrorState message={t("journal.historyError")} onRetry={() => void load()} />
    );
  }

  if (entries.length === 0) {
    return (
      <Card className="corners min-w-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-primary" aria-hidden="true" />
            {t("journal.pastEntries")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border border-dashed bg-accent/20 p-8 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <BookOpen className="h-6 w-6 text-primary/60" aria-hidden="true" />
            </div>
            <p className="text-sm text-muted-foreground">{t("journal.emptyHistory")}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="corners min-w-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-primary" aria-hidden="true" />
            {t("journal.pastEntries")}
          </CardTitle>
          <CardDescription>{entryCountLabel}</CardDescription>
        </CardHeader>
        <CardContent className="max-h-[min(70vh,640px)] space-y-2 overflow-y-auto pr-1 scrollbar-hide">
          {entries.map((entry) => (
            <EntryListItem
              key={entry.id}
              entry={entry}
              onSelect={() => setSelected(entry)}
              t={t}
            />
          ))}
        </CardContent>
      </Card>

      {selected && (
        <EntryDetailSheet entry={selected} onClose={() => setSelected(null)} t={t} />
      )}
    </>
  );
}
