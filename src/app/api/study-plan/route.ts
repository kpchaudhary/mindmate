import { NextResponse } from "next/server";
import { generateStudyPlan } from "@/lib/ai/gemini";
import { studyPlanGenerateRequestSchema } from "@/lib/ai/schemas";
import { isSessionUser, requireSession } from "@/lib/auth/require-session";
import {
  createStudyPlanWithItems,
  getActiveStudyPlan,
  getInsightsData,
  getUserById,
  startOfWeek,
} from "@/lib/db/repositories";
import type { Language } from "@/lib/db/schema";
import { enforceRateLimit, RATE_LIMITS } from "@/lib/enforce-rate-limit";

function serializePlan(result: NonNullable<Awaited<ReturnType<typeof getActiveStudyPlan>>>) {
  const doneCount = result.items.filter((item) => item.status === "done").length;
  return {
    plan: {
      id: result.plan.id,
      title: result.plan.title,
      weekStart: result.plan.weekStart.toISOString(),
      aiRationale: result.plan.aiRationale,
      status: result.plan.status,
      createdAt: result.plan.createdAt.toISOString(),
    },
    items: result.items.map((item) => ({
      id: item.id,
      subject: item.subject,
      topic: item.topic,
      description: item.description,
      durationMinutes: item.durationMinutes,
      scheduledDate: item.scheduledDate.toISOString(),
      status: item.status,
      sortOrder: item.sortOrder,
      isUserEdited: item.isUserEdited,
    })),
    progress: {
      total: result.items.length,
      done: doneCount,
      percent: result.items.length > 0 ? Math.round((doneCount / result.items.length) * 100) : 0,
    },
  };
}

export async function GET() {
  try {
    const sessionResult = await requireSession();
    if (!isSessionUser(sessionResult)) return sessionResult;

    const active = await getActiveStudyPlan(sessionResult.id);
    if (!active) {
      return NextResponse.json({ plan: null, items: [], progress: { total: 0, done: 0, percent: 0 } });
    }

    return NextResponse.json(serializePlan(active));
  } catch (error) {
    console.error("Study plan fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch study plan" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const rateLimited = enforceRateLimit(request, "study-plan:post", RATE_LIMITS.aiWrite.limit, RATE_LIMITS.aiWrite.windowMs);
  if (rateLimited) return rateLimited;

  try {
    const sessionResult = await requireSession();
    if (!isSessionUser(sessionResult)) return sessionResult;

    const body = await request.json().catch(() => ({}));
    const parsed = studyPlanGenerateRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const user = await getUserById(sessionResult.id);
    if (!user?.name || !user.examType) {
      return NextResponse.json({ error: "Profile incomplete" }, { status: 400 });
    }

    const insights = await getInsightsData(sessionResult.id);
    const weekStart = startOfWeek(new Date());
    const weekStartStr = weekStart.toISOString().slice(0, 10);
    const language = (user.language === "hi" ? "hi" : "en") as Language;

    const daysToExam = user.examDate
      ? Math.max(0, Math.ceil((user.examDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
      : null;

    const recentMoodScores = insights.recentWeekEntries.map((e) => e.moodScore);
    const avgMoodScore =
      recentMoodScores.length > 0
        ? Math.round(
            (recentMoodScores.reduce((a, b) => a + b, 0) / recentMoodScores.length) * 10
          ) / 10
        : null;

    const generated = await generateStudyPlan({
      studentName: user.name,
      examType: user.examType,
      daysToExam,
      focusNote: parsed.data.focusNote,
      recentBurnout: insights.recentBurnout,
      avgMoodScore,
      topTrigger: insights.topTrigger?.name ?? null,
      lowMoodStreak: insights.moodInsights.lowMoodStreak,
      weekStartDate: weekStartStr,
      language,
    });

    const created = await createStudyPlanWithItems(sessionResult.id, {
      title: generated.title,
      weekStart,
      aiRationale: generated.rationale,
      items: generated.items.map((item, index) => ({
        subject: item.subject,
        topic: item.topic,
        description: item.description,
        durationMinutes: item.durationMinutes,
        scheduledDate: new Date(`${item.scheduledDate}T09:00:00.000Z`),
        sortOrder: index,
      })),
    });

    return NextResponse.json(serializePlan(created));
  } catch (error) {
    console.error("Study plan generate error:", error);
    return NextResponse.json({ error: "Failed to generate study plan" }, { status: 500 });
  }
}
