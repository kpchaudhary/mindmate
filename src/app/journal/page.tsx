"use client";

import { useState } from "react";
import { BookOpen, Flame } from "lucide-react";
import { AppShell, useUser } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { JournalForm } from "@/features/journal/journal-form";
import { JournalHistory } from "@/features/journal/journal-history";
import { getTimeGreeting } from "@/lib/greeting";
import { useLanguage } from "@/lib/i18n/language-context";

function JournalHeader({
  user,
}: {
  user: { name: string; examType: string; streakCount: number };
}) {
  const { t } = useLanguage();
  const greeting = getTimeGreeting();

  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-primary" aria-hidden="true" />
          <h1 className="text-2xl font-bold">
            {greeting}, {user.name}
          </h1>
        </div>
        <p className="text-muted-foreground">
          {user.examType} · {t("journal.pageSubtitle")}
        </p>
      </div>
      {user.streakCount > 0 && (
        <Badge
          variant="outline"
          className="shrink-0 gap-1.5 border-orange-500/40 bg-orange-500/10 text-orange-600 dark:text-orange-400"
        >
          <Flame className="h-3.5 w-3.5" aria-hidden="true" />
          {user.streakCount} {t("dashboard.streakDays")}
        </Badge>
      )}
    </div>
  );
}

function JournalContent() {
  const user = useUser();
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <>
      <JournalHeader user={user} />
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <JournalForm user={user} onSubmitted={() => setRefreshKey((k) => k + 1)} />
        <JournalHistory refreshKey={refreshKey} />
      </div>
    </>
  );
}

export default function JournalPage() {
  return (
    <AppShell>
      <JournalContent />
    </AppShell>
  );
}
