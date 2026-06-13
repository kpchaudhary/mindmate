"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { BookOpen, Calendar, Flame, MessageCircle, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/error-state";
import { useCompanionChat } from "@/features/companion/companion-chat-context";
import { apiFetch } from "@/lib/api-client";
import { getTimeGreeting } from "@/lib/greeting";
import { useLanguage } from "@/lib/i18n/language-context";
import type { SessionUser } from "@/lib/auth/types";
import type { InsightsChartsProps } from "./insights-charts";

const InsightsCharts = dynamic<InsightsChartsProps>(
  () => import("./insights-charts").then((mod) => mod.InsightsCharts),
  {
    ssr: false,
    loading: () => (
      <div className="grid gap-6 lg:grid-cols-2">
        <ChartSkeleton />
        <ChartSkeleton />
        <ChartSkeleton />
        <ChartSkeleton />
      </div>
    ),
  }
);

type InsightsData = {
  triggerFrequency: Record<string, number>;
  moodTimeline: Array<{ date: string; moodScore: number; mood: string; burnoutLevel: string }>;
  burnoutTrend: Array<{ date: string; burnoutScore: number; burnoutLevel: string }>;
  mockScoreCorrelation: Array<{ date: string; mockScore: number; moodScore: number }>;
  topTrigger: { name: string; count: number } | null;
  recentBurnout: "low" | "medium" | "high";
  confidenceTrend: Array<{ date: string; confidence: number }>;
  totalEntries: number;
  entries: Array<{ burnoutReasoning: string }>;
  weeklySummary: { summary: string; actionableInsight: string } | null;
  moodInsights: {
    weeklyAverage: number | null;
    priorWeeklyAverage: number | null;
    delta: number | null;
    direction: "improving" | "stable" | "declining";
    byDayOfWeek: Array<{ day: string; average: number | null }>;
    topEmotions: Array<{ emotion: string; count: number }>;
    moodBurnoutCorrelation: { lowBurnoutAvg: number | null; highBurnoutAvg: number | null };
    lowMoodStreak: number;
  };
  moodSummary: {
    patternInsight: string;
    correlationNote: string;
    gentleAction: string;
  } | null;
  daysToExam: number | null;
  streakCount: number;
};

type InsightsDashboardProps = {
  user: SessionUser & { name: string; examType: string };
};

function ChartSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-48" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-48 sm:h-64 w-full" />
      </CardContent>
    </Card>
  );
}

export function InsightsDashboard({ user }: InsightsDashboardProps) {
  const { t, getExamCountdownNudge } = useLanguage();
  const { openChat } = useCompanionChat();
  const [data, setData] = useState<InsightsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const response = await apiFetch<InsightsData>("/api/insights");
      setData(response);
    } catch {
      setError(true);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <ChartSkeleton />
          <ChartSkeleton />
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        message={t("dashboard.loadError")}
        onRetry={() => void load()}
      />
    );
  }

  if (!data || data.totalEntries === 0) {
    return (
      <Card className="corners corners-purple">
        <CardHeader>
          <CardTitle>
            {t("dashboard.emptyWelcome")}, {user.name}
          </CardTitle>
          <CardDescription>{t("dashboard.emptyDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="bg-gradient-purple">
            <Link href="/journal">
              <BookOpen className="h-4 w-4" />
              {t("dashboard.writeJournal")}
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const triggerChartData = Object.entries(data.triggerFrequency)
    .map(([name, count]) => ({ name, count }))
    .filter((item) => item.count > 0)
    .sort((a, b) => b.count - a.count);

  const latestReasoning =
    data.entries[0]?.burnoutReasoning ?? "Based on your recent journal patterns.";

  const latestMood = data.moodTimeline[data.moodTimeline.length - 1]?.moodScore ?? null;
  const moodTrendLabel =
    data.moodInsights.direction === "improving"
      ? t("dashboard.moodTrendImproving")
      : data.moodInsights.direction === "declining"
        ? t("dashboard.moodTrendDeclining")
        : t("dashboard.moodTrendStable");
  const moodByDayChart = data.moodInsights.byDayOfWeek.filter((d) => d.average !== null);
  const yAxisWidth = Math.min(
    160,
    Math.max(80, ...triggerChartData.map((d) => d.name.length * 6))
  );

  return (
    <div className="space-y-6">
      {data.daysToExam !== null && (
        <Card className="line-bg border-primary/30">
          <CardContent className="flex items-start gap-3 p-4">
            <Calendar className="h-5 w-5 shrink-0 text-primary mt-0.5" />
            <div>
              <p className="font-semibold">
                {data.daysToExam} {t("dashboard.daysLeft")} · {user.examType}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {getExamCountdownNudge(data.daysToExam, data.recentBurnout, user.examType)}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">{t("dashboard.totalEntries")}</p>
            <p className="text-2xl font-bold">{data.totalEntries}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">{t("dashboard.streak")}</p>
            <p className="text-2xl font-bold flex items-center gap-1.5">
              <Flame className="h-5 w-5 text-orange-500" />
              {data.streakCount}
            </p>
            <p className="text-xs text-muted-foreground">{t("dashboard.streakDays")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">{t("dashboard.currentBurnout")}</p>
            <Badge variant="outline" className="mt-1 capitalize">
              {data.recentBurnout}
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">{t("dashboard.topTrigger")}</p>
            <p className="text-sm font-medium capitalize truncate">
              {data.topTrigger?.name ?? "None yet"}
            </p>
          </CardContent>
        </Card>
      </div>

      {data.moodSummary && (
        <Card className="corners corners-purple border-primary/20">
          <CardHeader>
            <div className="flex flex-wrap items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <CardTitle>{t("dashboard.moodInsights")}</CardTitle>
              {data.moodInsights.weeklyAverage !== null && (
                <Badge variant="outline">
                  {t("dashboard.weeklyAverage")}: {data.moodInsights.weeklyAverage}/5 ·{" "}
                  {moodTrendLabel}
                </Badge>
              )}
            </div>
            <CardDescription>{data.moodSummary.patternInsight}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-lg bg-accent/50 p-3">
              <p className="text-xs font-medium text-muted-foreground mb-1">
                {t("dashboard.moodCorrelation")}
              </p>
              <p className="text-sm">{data.moodSummary.correlationNote}</p>
            </div>
            <div className="rounded-lg bg-accent/50 p-3">
              <p className="text-xs font-medium text-muted-foreground mb-1">
                {t("dashboard.moodAction")}
              </p>
              <p className="text-sm">{data.moodSummary.gentleAction}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {data.weeklySummary && (
        <Card className="corners corners-purple border-primary/20">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <CardTitle>{t("dashboard.weeklySummary")}</CardTitle>
            </div>
            <CardDescription>{data.weeklySummary.summary}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg bg-accent/50 p-3">
              <p className="text-xs font-medium text-muted-foreground mb-1">
                {t("dashboard.actionableInsight")}
              </p>
              <p className="text-sm">{data.weeklySummary.actionableInsight}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {data.topTrigger && data.topTrigger.count > 0 && (
        <Card className="line-bg border-primary/30">
          <CardHeader>
            <CardTitle className="text-primary">{t("dashboard.hiddenPattern")}</CardTitle>
            <CardDescription>
              Your most recurring stress trigger is{" "}
              <strong className="text-foreground">{data.topTrigger.name}</strong> — logged{" "}
              {data.topTrigger.count} time{data.topTrigger.count > 1 ? "s" : ""}. MindMate
              personalizes support around this pattern.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      <InsightsCharts
        data={data}
        moodTrendLabel={moodTrendLabel}
        moodByDayChart={moodByDayChart}
        triggerChartData={triggerChartData}
        yAxisWidth={yAxisWidth}
        latestMood={latestMood}
        latestReasoning={latestReasoning}
        t={t}
      />

      <div className="flex flex-wrap gap-3">
        <Button asChild className="bg-gradient-purple">
          <Link href="/journal">
            <BookOpen className="h-4 w-4" />
            {t("dashboard.writeJournal")}
          </Link>
        </Button>
        <Button variant="outline" onClick={openChat}>
          <MessageCircle className="h-4 w-4" />
          {t("dashboard.openCompanion")}
        </Button>
      </div>
    </div>
  );
}

export function DashboardHeader({
  user,
}: {
  user: SessionUser & { name: string; examType: string };
}) {
  const { t } = useLanguage();
  const greeting = getTimeGreeting();
  return (
    <div className="mb-6 space-y-1">
      <h1 className="text-2xl font-bold">
        {greeting}, {user.name}
      </h1>
      <p className="text-muted-foreground">
        {user.examType} {t("dashboard.subtitle")}
      </p>
    </div>
  );
}
