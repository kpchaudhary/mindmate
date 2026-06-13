"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { BookOpen, MessageCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/error-state";
import { BurnoutGauge } from "@/components/ui/burnout-gauge";
import { getTimeGreeting } from "@/lib/greeting";
import type { StoredUser } from "@/lib/user-storage";

type InsightsData = {
  triggerFrequency: Record<string, number>;
  moodTimeline: Array<{ date: string; moodScore: number; mood: string; burnoutLevel: string }>;
  topTrigger: { name: string; count: number } | null;
  recentBurnout: "low" | "medium" | "high";
  confidenceTrend: Array<{ date: string; confidence: number }>;
  totalEntries: number;
  entries: Array<{ burnoutReasoning: string }>;
};

type InsightsDashboardProps = {
  user: StoredUser;
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
  const [data, setData] = useState<InsightsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const response = await fetch(`/api/insights?userId=${user.id}`);
      if (!response.ok) throw new Error("Failed");
      setData(await response.json());
    } catch {
      setError(true);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-3 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
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
        message="Could not load your dashboard. Check your connection and try again."
        onRetry={() => void load()}
      />
    );
  }

  if (!data || data.totalEntries === 0) {
    return (
      <Card className="corners corners-purple">
        <CardHeader>
          <CardTitle>Welcome to your dashboard, {user.name}</CardTitle>
          <CardDescription>
            Once you submit your first journal entry, MindMate will surface mood trends, stress
            patterns, and burnout estimates here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="bg-gradient-purple">
            <Link href="/journal">
              <BookOpen className="h-4 w-4" />
              Write your first journal entry
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
  const yAxisWidth = Math.min(
    160,
    Math.max(80, ...triggerChartData.map((d) => d.name.length * 6))
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total entries</p>
            <p className="text-2xl font-bold">{data.totalEntries}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Current burnout</p>
            <Badge variant="outline" className="mt-1 capitalize">
              {data.recentBurnout}
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Top trigger</p>
            <p className="text-sm font-medium capitalize truncate">
              {data.topTrigger?.name ?? "None yet"}
            </p>
          </CardContent>
        </Card>
      </div>

      {data.topTrigger && data.topTrigger.count > 0 && (
        <Card className="line-bg border-primary/30">
          <CardHeader>
            <CardTitle className="text-primary">Hidden Pattern Discovered</CardTitle>
            <CardDescription>
              Your most recurring stress trigger is{" "}
              <strong className="text-foreground">{data.topTrigger.name}</strong> — logged{" "}
              {data.topTrigger.count} time{data.topTrigger.count > 1 ? "s" : ""}. MindMate
              personalizes support around this pattern.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Mood Timeline</CardTitle>
            <CardDescription>
              Track emotional shifts across your prep journey
              {latestMood !== null && ` · Latest: ${latestMood}/5`}
            </CardDescription>
          </CardHeader>
          <CardContent className="h-48 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.moodTimeline}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis domain={[1, 5]} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="moodScore" stroke="hsl(var(--chart-primary))" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Stress Trigger Frequency</CardTitle>
            <CardDescription>What keeps showing up in your journals</CardDescription>
          </CardHeader>
          <CardContent className="h-48 sm:h-64">
            {triggerChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={triggerChartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
                  <YAxis dataKey="name" type="category" width={yAxisWidth} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(var(--chart-primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground">More entries needed to chart triggers.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Confidence Trend</CardTitle>
            <CardDescription>Higher is better — derived from mood and trigger patterns</CardDescription>
          </CardHeader>
          <CardContent className="h-48 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.confidenceTrend}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 5]} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="confidence" stroke="hsl(var(--chart-primary))" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Current Burnout Estimate</CardTitle>
            <CardDescription>AI-assessed from your recent entries</CardDescription>
          </CardHeader>
          <CardContent>
            <BurnoutGauge level={data.recentBurnout} reasoning={latestReasoning} />
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button asChild className="bg-gradient-purple">
          <Link href="/journal">
            <BookOpen className="h-4 w-4" />
            Write journal
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/companion">
            <MessageCircle className="h-4 w-4" />
            Open companion
          </Link>
        </Button>
      </div>
    </div>
  );
}

export function DashboardHeader({ user }: { user: StoredUser }) {
  const greeting = getTimeGreeting();
  return (
    <div className="mb-6 space-y-1">
      <h1 className="text-2xl font-bold">
        {greeting}, {user.name}
      </h1>
      <p className="text-muted-foreground">
        {user.examType} prep dashboard — patterns and trends from your journals.
      </p>
    </div>
  );
}
