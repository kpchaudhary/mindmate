import { NextResponse } from "next/server";
import { companionRequestSchema } from "@/lib/ai/schemas";
import { generateCompanionReply } from "@/lib/ai/gemini";
import {
  getChatHistory,
  getInsightsData,
  getLatestAnalysisSummary,
  getUserById,
  saveChatMessage,
} from "@/lib/db/repositories";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = companionRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const { userId, message } = parsed.data;
    const user = await getUserById(userId);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const [chatHistory, insights, latestAnalysis] = await Promise.all([
      getChatHistory(userId, 20),
      getInsightsData(userId),
      getLatestAnalysisSummary(userId),
    ]);

    await saveChatMessage(userId, "user", message);

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
    });

    const savedReply = await saveChatMessage(userId, "assistant", reply);

    return NextResponse.json({
      message: savedReply.content,
      id: savedReply.id,
    });
  } catch (error) {
    console.error("Companion error:", error);
    return NextResponse.json({ error: "Failed to generate reply" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const chatHistory = await getChatHistory(userId, 50);
    return NextResponse.json({
      messages: chatHistory.map((m) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        createdAt: m.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Companion history error:", error);
    return NextResponse.json({ error: "Failed to fetch chat history" }, { status: 500 });
  }
}
