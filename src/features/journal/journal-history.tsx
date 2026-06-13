"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/error-state";
import { InsightCard, type InsightData } from "@/features/journal/insight-card";
import { formatDate } from "@/lib/format-date";
import type { StoredUser } from "@/lib/user-storage";

const MOOD_LABELS = ["Very low", "Low", "Okay", "Good", "Great"];

export type JournalEntryItem = {
  id: string;
  content: string;
  moodScore: number;
  createdAt: string;
  analysis: InsightData;
};

type JournalHistoryProps = {
  user: StoredUser;
  refreshKey?: number;
};

export function JournalHistory({ user, refreshKey = 0 }: JournalHistoryProps) {
  const [entries, setEntries] = useState<JournalEntryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selected, setSelected] = useState<JournalEntryItem | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const response = await fetch(`/api/journal?userId=${user.id}`);
      if (!response.ok) throw new Error("Failed");
      const data = (await response.json()) as { entries: JournalEntryItem[] };
      setEntries(data.entries);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  useEffect(() => {
    void load();
  }, [load, refreshKey]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Past Entries</CardTitle>
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
    return <ErrorState message="Could not load your journal history." onRetry={() => void load()} />;
  }

  if (entries.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Past Entries</CardTitle>
          <CardDescription>Your journal history will appear here after your first check-in.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Past Entries</CardTitle>
          <CardDescription>{entries.length} journal {entries.length === 1 ? "entry" : "entries"}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {entries.map((entry) => (
            <button
              key={entry.id}
              type="button"
              onClick={() => setSelected(entry)}
              className="flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-accent/50"
            >
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {formatDate(entry.createdAt)}
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    {MOOD_LABELS[entry.moodScore - 1]}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="text-xs capitalize"
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
            <SheetTitle>
              {selected && formatDate(selected.createdAt, "long")}
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
