import { NextResponse } from "next/server";
import { companionRequestSchema } from "@/lib/ai/schemas";
import { generateCompanionReply } from "@/lib/ai/gemini";
import { isSessionUser, requireSession } from "@/lib/auth/require-session";
import {
  getChatHistory,
  getInsightsData,
  getLatestAnalysisSummary,
  getUserById,
  saveChatMessage,
} from "@/lib/db/repositories";
import { getPromptChips } from "@/lib/i18n/translations";

export async function POST(request: Request) {
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

    const [chatHistory, insights, latestAnalysis] = await Promise.all([
      getChatHistory(sessionResult.id, 20),
      getInsightsData(sessionResult.id),
      getLatestAnalysisSummary(sessionResult.id),
    ]);

    await saveChatMessage(sessionResult.id, "user", message);

    const recentTriggers = insights.entries
      .slice(0, 3)
      .flatMap((e) => (e.triggers as string[]) ?? []);

    const reply = await generateCompanionReply({
      studentName: user.name,
      examType: user.examType,
      message,
      recentTriggers,
      topTrigger: insights.topTrigger?.name ?? null,
      burnoutLevel: latestAnalysis?.burnoutLevel ?? insights.recentBurnout,
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

    const [chatHistory, insights, user] = await Promise.all([
      getChatHistory(sessionResult.id, 50),
      getInsightsData(sessionResult.id),
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
      topTrigger: insights.topTrigger?.name ?? null,
      promptChips: getPromptChips(insights.topTrigger?.name ?? null, language),
    });
  } catch (error) {
    console.error("Companion history error:", error);
    return NextResponse.json({ error: "Failed to fetch chat history" }, { status: 500 });
  }
}
