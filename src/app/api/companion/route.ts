import { NextResponse } from "next/server";
import { companionRequestSchema } from "@/lib/ai/schemas";
import { generateCompanionReply } from "@/lib/ai/gemini";
import { isSessionUser, requireSession } from "@/lib/auth/require-session";
import {
  getChatHistory,
  getLatestAnalysisSummary,
  getRecentJournalContext,
  getTopTriggerForUser,
  getUserById,
  saveChatMessage,
} from "@/lib/db/repositories";
import { getPromptChips } from "@/lib/i18n/translations";
import { enforceRateLimit, RATE_LIMITS } from "@/lib/enforce-rate-limit";

export async function POST(request: Request) {
  const rateLimited = enforceRateLimit(request, "companion:post", RATE_LIMITS.aiWrite.limit, RATE_LIMITS.aiWrite.windowMs);
  if (rateLimited) return rateLimited;

  try {
    const sessionResult = await requireSession();
    if (!isSessionUser(sessionResult)) return sessionResult;

    const body = await request.json();
    const parsed = companionRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const { message } = parsed.data;
    const user = await getUserById(sessionResult.id);

    if (!user || !user.name || !user.examType) {
      return NextResponse.json({ error: "Profile incomplete" }, { status: 400 });
    }

    const [chatHistory, recentEntries, topTrigger, latestAnalysis] = await Promise.all([
      getChatHistory(sessionResult.id, 20),
      getRecentJournalContext(sessionResult.id, 3),
      getTopTriggerForUser(sessionResult.id),
      getLatestAnalysisSummary(sessionResult.id),
    ]);

    await saveChatMessage(sessionResult.id, "user", message);

    const recentTriggers = recentEntries.flatMap((e) => (e.triggers as string[]) ?? []);

    const reply = await generateCompanionReply({
      studentName: user.name,
      examType: user.examType,
      message,
      recentTriggers,
      topTrigger: topTrigger?.name ?? null,
      burnoutLevel: latestAnalysis?.burnoutLevel ?? "low",
      recentRecommendation: latestAnalysis?.recommendation ?? null,
      chatHistory: chatHistory.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
      language: user.language === "hi" ? "hi" : "en",
    });

    const savedReply = await saveChatMessage(sessionResult.id, "assistant", reply);

    return NextResponse.json({
      message: savedReply.content,
      id: savedReply.id,
    });
  } catch (error) {
    console.error("Companion error:", error);
    return NextResponse.json({ error: "Failed to generate reply" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const sessionResult = await requireSession();
    if (!isSessionUser(sessionResult)) return sessionResult;

    const [chatHistory, topTrigger, user] = await Promise.all([
      getChatHistory(sessionResult.id, 50),
      getTopTriggerForUser(sessionResult.id),
      getUserById(sessionResult.id),
    ]);

    const language = user?.language === "hi" ? "hi" : "en";

    return NextResponse.json({
      messages: chatHistory.map((m) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        createdAt: m.createdAt.toISOString(),
      })),
      topTrigger: topTrigger?.name ?? null,
      promptChips: getPromptChips(topTrigger?.name ?? null, language),
    });
  } catch (error) {
    console.error("Companion history error:", error);
    return NextResponse.json({ error: "Failed to fetch chat history" }, { status: 500 });
  }
}
