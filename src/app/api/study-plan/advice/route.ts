import { NextResponse } from "next/server";
import { getStudyPlanAdvice } from "@/lib/ai/gemini";
import { studyPlanAdviceRequestSchema } from "@/lib/ai/schemas";
import { isSessionUser, requireSession } from "@/lib/auth/require-session";
import { getActiveStudyPlan, getInsightsData, getUserById } from "@/lib/db/repositories";
import type { Language } from "@/lib/db/schema";
import { enforceRateLimit, RATE_LIMITS } from "@/lib/enforce-rate-limit";

export async function POST(request: Request) {
  const rateLimited = enforceRateLimit(request, "study-plan:advice", RATE_LIMITS.aiWrite.limit, RATE_LIMITS.aiWrite.windowMs);
  if (rateLimited) return rateLimited;

  try {
    const sessionResult = await requireSession();
    if (!isSessionUser(sessionResult)) return sessionResult;

    const body = await request.json();
    const parsed = studyPlanAdviceRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const user = await getUserById(sessionResult.id);
    if (!user?.name || !user.examType) {
      return NextResponse.json({ error: "Profile incomplete" }, { status: 400 });
    }

    const active = await getActiveStudyPlan(sessionResult.id);
    if (!active) {
      return NextResponse.json({ error: "No active study plan" }, { status: 404 });
    }

    const insights = await getInsightsData(sessionResult.id);
    const recentMoodScores = insights.recentWeekEntries.map((e) => e.moodScore);
    const avgMoodScore =
      recentMoodScores.length > 0
        ? Math.round(
            (recentMoodScores.reduce((a, b) => a + b, 0) / recentMoodScores.length) * 10
          ) / 10
        : null;

    const pendingItems = active.items
      .filter((item) => item.status === "pending")
      .map((item) => ({
        subject: item.subject,
        topic: item.topic,
        scheduledDate: item.scheduledDate.toISOString().slice(0, 10),
        durationMinutes: item.durationMinutes,
      }));

    const advice = await getStudyPlanAdvice({
      studentName: user.name,
      examType: user.examType,
      message: parsed.data.message,
      planTitle: active.plan.title,
      pendingItems,
      recentBurnout: insights.recentBurnout,
      avgMoodScore,
      language: (user.language === "hi" ? "hi" : "en") as Language,
    });

    return NextResponse.json(advice);
  } catch (error) {
    console.error("Study plan advice error:", error);
    return NextResponse.json({ error: "Failed to get study plan advice" }, { status: 500 });
  }
}
