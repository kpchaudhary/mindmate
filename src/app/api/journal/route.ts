import { NextResponse } from "next/server";
import { journalRequestSchema } from "@/lib/ai/schemas";
import { analyzeJournal } from "@/lib/ai/gemini";
import { isSessionUser, requireSession } from "@/lib/auth/require-session";
import {
  createJournalWithAnalysis,
  getJournalEntriesForUser,
  getRecentJournalContext,
  getTriggerFrequency,
  getUserById,
  updateStreakOnJournal,
} from "@/lib/db/repositories";
import { enforceRateLimit, RATE_LIMITS } from "@/lib/enforce-rate-limit";

export async function GET() {
  try {
    const sessionResult = await requireSession();
    if (!isSessionUser(sessionResult)) return sessionResult;

    const entries = await getJournalEntriesForUser(sessionResult.id);

    return NextResponse.json(
      {
        entries: entries.map((entry) => ({
          id: entry.id,
          content: entry.content,
          moodScore: entry.moodScore,
          createdAt: entry.createdAt.toISOString(),
          analysis: {
            mood: entry.mood,
            emotionalPatterns: entry.emotions,
            stressTriggers: entry.triggers,
            copingStrategy: entry.copingStrategy,
            motivation: entry.motivation,
            wellnessRecommendation: entry.recommendation,
            burnoutLevel: entry.burnoutLevel,
            burnoutReasoning: entry.burnoutReasoning,
            riskFlag: entry.riskFlag,
          },
        })),
      },
      {
        headers: {
          "Cache-Control": "private, max-age=60",
        },
      }
    );
  } catch (error) {
    console.error("Journal fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch journal entries" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const rateLimited = enforceRateLimit(request, "journal:post", RATE_LIMITS.aiWrite.limit, RATE_LIMITS.aiWrite.windowMs);
  if (rateLimited) return rateLimited;

  try {
    const sessionResult = await requireSession();
    if (!isSessionUser(sessionResult)) return sessionResult;

    const body = await request.json();
    const parsed = journalRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const { content, moodScore, mockScore } = parsed.data;
    const user = await getUserById(sessionResult.id);

    if (!user || !user.name || !user.examType) {
      return NextResponse.json({ error: "Profile incomplete" }, { status: 400 });
    }

    const [recentEntries, triggerFrequency] = await Promise.all([
      getRecentJournalContext(sessionResult.id, 5),
      getTriggerFrequency(sessionResult.id),
    ]);

    const analysis = await analyzeJournal({
      studentName: user.name,
      examType: user.examType,
      moodScore,
      journalContent: content,
      recentEntries: recentEntries.map((e) => ({
        content: e.content,
        moodScore: e.moodScore,
        mood: e.mood,
        triggers: (e.triggers as string[] | null) ?? null,
        burnoutLevel: e.burnoutLevel,
      })),
      triggerFrequency,
      language: user.language === "hi" ? "hi" : "en",
    });

    const { entry, analysis: savedAnalysis } = await createJournalWithAnalysis({
      userId: sessionResult.id,
      content,
      moodScore,
      mockScore: mockScore ?? null,
      analysis: {
        mood: analysis.mood,
        emotions: analysis.emotionalPatterns,
        triggers: analysis.stressTriggers,
        copingStrategy: analysis.copingStrategy,
        motivation: analysis.motivation,
        recommendation: analysis.wellnessRecommendation,
        burnoutLevel: analysis.burnoutLevel,
        burnoutReasoning: analysis.burnoutReasoning,
        riskFlag: analysis.riskFlag,
        raw: analysis as unknown as Record<string, unknown>,
      },
    });

    const streakCount = await updateStreakOnJournal(sessionResult.id);

    return NextResponse.json({
      entryId: entry.id,
      streakCount,
      analysis: {
        mood: savedAnalysis.mood,
        emotionalPatterns: savedAnalysis.emotions,
        stressTriggers: savedAnalysis.triggers,
        copingStrategy: savedAnalysis.copingStrategy,
        motivation: savedAnalysis.motivation,
        wellnessRecommendation: savedAnalysis.recommendation,
        burnoutLevel: savedAnalysis.burnoutLevel,
        burnoutReasoning: savedAnalysis.burnoutReasoning,
        riskFlag: savedAnalysis.riskFlag,
      },
    });
  } catch (error) {
    console.error("Journal analysis error:", error);
    return NextResponse.json({ error: "Failed to analyze journal" }, { status: 500 });
  }
}
