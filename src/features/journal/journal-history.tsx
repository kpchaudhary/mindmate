"use client";

import { useCallback, useEffect, useState } from "react";
import { BookOpen, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/error-state";
import { InsightCard, type InsightData } from "@/features/journal/insight-card";
import { BURNOUT_BADGE_STYLES, getMoodEmoji } from "@/lib/mood";
import { formatDate } from "@/lib/format-date";
import { useLanguage } from "@/lib/i18n/language-context";
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
      <Card className="corners">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-primary" aria-hidden="true" />
            {t("journal.pastEntries")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
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
      <Card className="corners">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-primary" aria-hidden="true" />
            {t("journal.pastEntries")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-dashed p-6 text-center">
            <BookOpen className="mx-auto h-8 w-8 text-muted-foreground/50 mb-3" aria-hidden="true" />
            <p className="text-sm text-muted-foreground">{t("journal.emptyHistory")}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="corners">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-primary" aria-hidden="true" />
            {t("journal.pastEntries")}
          </CardTitle>
          <CardDescription>{entryCountLabel}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {entries.map((entry) => (
            <button
              key={entry.id}
              type="button"
              onClick={() => setSelected(entry)}
              className="flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-accent/50 hover:border-primary/30"
            >
              <span className="text-xl shrink-0" aria-hidden="true">
                {getMoodEmoji(entry.moodScore)}
              </span>
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {formatDate(entry.createdAt)}
                  </span>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs capitalize",
                      BURNOUT_BADGE_STYLES[entry.analysis.burnoutLevel]
                    )}
                  >
                    {entry.analysis.burnoutLevel} burnout
                  </Badge>
                </div>
                <p className="truncate text-sm">{entry.content}</p>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            </button>
          ))}
        </CardContent>
      </Card>

      <Sheet open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <SheetContent className="overflow-y-auto sm:max-w-lg">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              {selected && (
                <>
                  <span aria-hidden="true">{getMoodEmoji(selected.moodScore)}</span>
                  {formatDate(selected.createdAt, "long")}
                </>
              )}
            </SheetTitle>
          </SheetHeader>
          {selected && (
            <div className="mt-4 space-y-4">
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{selected.content}</p>
              <InsightCard insight={selected.analysis} />
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
