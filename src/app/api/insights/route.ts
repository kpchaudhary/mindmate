import { NextResponse } from "next/server";
import { getCachedMoodSummary, getCachedWeeklySummary } from "@/lib/ai/insights-summaries";
import { isSessionUser, requireSession } from "@/lib/auth/require-session";
import { getInsightsData, getUserById } from "@/lib/db/repositories";
import { getPromptChips } from "@/lib/i18n/translations";
import type { Language } from "@/lib/db/schema";
import { enforceRateLimit, RATE_LIMITS } from "@/lib/enforce-rate-limit";

export async function GET(request: Request) {
  const rateLimited = enforceRateLimit(request, "insights:get", RATE_LIMITS.aiRead.limit, RATE_LIMITS.aiRead.windowMs);
  if (rateLimited) return rateLimited;

  try {
    const sessionResult = await requireSession();
    if (!isSessionUser(sessionResult)) return sessionResult;

    const user = await getUserById(sessionResult.id);
    const insights = await getInsightsData(sessionResult.id);
    const language = (user?.language === "hi" ? "hi" : "en") as Language;

    let weeklySummary: { summary: string; actionableInsight: string } | null = null;
    let moodSummary: { patternInsight: string; correlationNote: string; gentleAction: string } | null =
      null;

    if (
      user?.name &&
      user.examType &&
      insights.recentWeekEntries.length >= 2
    ) {
      try {
        weeklySummary = await getCachedWeeklySummary(sessionResult.id, {
          studentName: user.name,
          examType: user.examType,
          entries: insights.recentWeekEntries.map((e) => ({
            date: e.createdAt.toISOString().slice(0, 10),
            moodScore: e.moodScore,
            mood: e.mood,
            triggers: (e.triggers as string[]) ?? [],
            burnoutLevel: e.burnoutLevel,
            content: e.content,
          })),
          triggerFrequency: insights.triggerFrequency,
          language,
        });
      } catch (error) {
        console.error("Weekly summary error:", error);
      }

      try {
        moodSummary = await getCachedMoodSummary(sessionResult.id, {
          studentName: user.name,
          examType: user.examType,
          moodTimeline: insights.moodTimeline,
          byDayOfWeek: insights.moodInsights.byDayOfWeek,
          topEmotions: insights.moodInsights.topEmotions,
          moodBurnoutCorrelation: insights.moodInsights.moodBurnoutCorrelation,
          direction: insights.moodInsights.direction,
          weeklyAverage: insights.moodInsights.weeklyAverage,
          language,
        });
      } catch (error) {
        console.error("Mood summary error:", error);
      }
    }

    const daysToExam = user?.examDate
      ? Math.max(
          0,
          Math.ceil(
            (user.examDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
          )
        )
      : null;

    return NextResponse.json(
      {
        triggerFrequency: insights.triggerFrequency,
        moodTimeline: insights.moodTimeline,
        burnoutTrend: insights.burnoutTrend,
        mockScoreCorrelation: insights.mockScoreCorrelation,
        topTrigger: insights.topTrigger,
        recentBurnout: insights.recentBurnout,
        confidenceTrend: insights.confidenceTrend,
        totalEntries: insights.totalEntries,
        entries: insights.entries.map((e) => ({ burnoutReasoning: e.burnoutReasoning })),
        weeklySummary,
        moodInsights: insights.moodInsights,
        moodSummary,
        daysToExam,
        streakCount: user?.streakCount ?? 0,
        examDate: user?.examDate?.toISOString() ?? null,
        promptChips: getPromptChips(insights.topTrigger?.name ?? null, language),
      },
      {
        headers: {
          "Cache-Control": "private, max-age=60",
        },
      }
    );
  } catch (error) {
    console.error("Insights error:", error);
    return NextResponse.json({ error: "Failed to fetch insights" }, { status: 500 });
  }
}
