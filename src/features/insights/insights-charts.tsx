"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BurnoutGauge } from "@/components/ui/burnout-gauge";
import type { TranslationKey } from "@/lib/i18n/translations";

type ChartInsightsData = {
  moodTimeline: Array<{ date: string; moodScore: number; mood: string; burnoutLevel: string }>;
  burnoutTrend: Array<{ date: string; burnoutScore: number; burnoutLevel: string }>;
  mockScoreCorrelation: Array<{ date: string; mockScore: number; moodScore: number }>;
  recentBurnout: "low" | "medium" | "high";
  confidenceTrend: Array<{ date: string; confidence: number }>;
  moodInsights: {
    topEmotions: Array<{ emotion: string; count: number }>;
  };
};

export type InsightsChartsProps = {
  data: ChartInsightsData;
  moodTrendLabel: string;
  moodByDayChart: Array<{ day: string; average: number | null }>;
  triggerChartData: Array<{ name: string; count: number }>;
  yAxisWidth: number;
  latestMood: number | null;
  latestReasoning: string;
  t: (key: TranslationKey) => string;
};

export function InsightsCharts({
  data,
  moodTrendLabel,
  moodByDayChart,
  triggerChartData,
  yAxisWidth,
  latestMood,
  latestReasoning,
  t,
}: InsightsChartsProps) {
  const chartSummary = [
    moodByDayChart.length > 0
      ? `Mood by day of week trend is ${moodTrendLabel.toLowerCase()}.`
      : null,
    data.moodTimeline.length > 0
      ? `Mood timeline includes ${data.moodTimeline.length} journal days${
          latestMood !== null ? ` with latest mood ${latestMood} out of 5` : ""
        }.`
      : null,
    triggerChartData.length > 0
      ? `Top stress trigger is ${triggerChartData[0]?.name} logged ${triggerChartData[0]?.count} times.`
      : null,
    `Current burnout estimate is ${data.recentBurnout}.`,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      <p className="sr-only">{chartSummary}</p>
      <div className="grid gap-6 lg:grid-cols-2">
      {moodByDayChart.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t("dashboard.moodByDay")}</CardTitle>
            <CardDescription>
              {t("dashboard.moodTrend")}: {moodTrendLabel}
            </CardDescription>
          </CardHeader>
          <CardContent className="h-48 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={moodByDayChart}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis domain={[1, 5]} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="average" fill="hsl(var(--chart-primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {data.moodInsights.topEmotions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t("dashboard.topEmotions")}</CardTitle>
            <CardDescription>Most frequent emotional patterns from your journals</CardDescription>
          </CardHeader>
          <CardContent className="h-48 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data.moodInsights.topEmotions.map((e) => ({
                  name: e.emotion,
                  count: e.count,
                }))}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
                <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--chart-primary))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{t("dashboard.moodTimeline")}</CardTitle>
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
              <Line
                type="monotone"
                dataKey="moodScore"
                stroke="hsl(var(--chart-primary))"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("dashboard.burnoutTrend")}</CardTitle>
          <CardDescription>1 = low, 2 = medium, 3 = high</CardDescription>
        </CardHeader>
        <CardContent className="h-48 sm:h-64">
          {data.burnoutTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.burnoutTrend}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis domain={[1, 3]} ticks={[1, 2, 3]} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="burnoutScore"
                  stroke="hsl(var(--destructive))"
                  strokeWidth={2}
                  dot
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground">More entries needed to chart burnout trend.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("dashboard.triggerFrequency")}</CardTitle>
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

      {data.mockScoreCorrelation.length >= 2 ? (
        <Card>
          <CardHeader>
            <CardTitle>{t("dashboard.mockScoreCorrelation")}</CardTitle>
            <CardDescription>How mock scores relate to your mood</CardDescription>
          </CardHeader>
          <CardContent className="h-48 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={data.mockScoreCorrelation}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis yAxisId="left" domain={[0, 100]} tick={{ fontSize: 12 }} />
                <YAxis yAxisId="right" orientation="right" domain={[1, 5]} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="mockScore"
                  stroke="hsl(var(--chart-primary))"
                  strokeWidth={2}
                  name="Mock score"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="moodScore"
                  stroke="hsl(var(--destructive))"
                  strokeWidth={2}
                  name="Mood"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>{t("dashboard.confidenceTrend")}</CardTitle>
            <CardDescription>Higher is better — derived from mood and trigger patterns</CardDescription>
          </CardHeader>
          <CardContent className="h-48 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.confidenceTrend}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 5]} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="confidence"
                  stroke="hsl(var(--chart-primary))"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{t("dashboard.burnoutEstimate")}</CardTitle>
          <CardDescription>AI-assessed from your recent entries</CardDescription>
        </CardHeader>
        <CardContent>
          <BurnoutGauge level={data.recentBurnout} reasoning={latestReasoning} />
        </CardContent>
      </Card>
      </div>
    </>
  );
}
