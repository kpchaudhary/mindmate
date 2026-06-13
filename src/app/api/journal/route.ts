import { NextResponse } from "next/server";
import { journalRequestSchema } from "@/lib/ai/schemas";
import { analyzeJournal } from "@/lib/ai/gemini";
import {
  createJournalWithAnalysis,
  getJournalEntriesForUser,
  getRecentJournalContext,
  getTriggerFrequency,
  getUserById,
} from "@/lib/db/repositories";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const entries = await getJournalEntriesForUser(userId);

    return NextResponse.json({
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
    });
  } catch (error) {
    console.error("Journal fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch journal entries" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = journalRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const { userId, content, moodScore } = parsed.data;
    const user = await getUserById(userId);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const [recentEntries, triggerFrequency] = await Promise.all([
      getRecentJournalContext(userId, 5),
      getTriggerFrequency(userId),
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
    });

    const { entry, analysis: savedAnalysis } = await createJournalWithAnalysis({
      userId,
      content,
      moodScore,
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

    return NextResponse.json({
      entryId: entry.id,
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
