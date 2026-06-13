import { NextResponse } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";

vi.mock("@/lib/auth/require-session", () => ({
  requireSession: vi.fn(),
  isSessionUser: vi.fn((result) => !(result instanceof NextResponse)),
}));

vi.mock("@/lib/ai/gemini", () => ({
  generateCompanionReply: vi.fn(),
}));

vi.mock("@/lib/db/repositories", () => ({
  getChatHistory: vi.fn(),
  getInsightsData: vi.fn(),
  getLatestAnalysisSummary: vi.fn(),
  getUserById: vi.fn(),
  saveChatMessage: vi.fn(),
}));

import { requireSession } from "@/lib/auth/require-session";
import { generateCompanionReply } from "@/lib/ai/gemini";
import {
  getChatHistory,
  getInsightsData,
  getLatestAnalysisSummary,
  getUserById,
  saveChatMessage,
} from "@/lib/db/repositories";

describe("POST /api/companion", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 without session", async () => {
    vi.mocked(requireSession).mockResolvedValue(
      NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    );

    const response = await POST(
      new Request("http://localhost/api/companion", {
        method: "POST",
        body: JSON.stringify({ message: "Hello" }),
      })
    );
    expect(response.status).toBe(401);
  });

  it("returns 400 for empty message", async () => {
    vi.mocked(requireSession).mockResolvedValue({
      id: "user-1",
      email: "student@example.com",
      name: "Priya",
      examType: "NEET",
    });

    const response = await POST(
      new Request("http://localhost/api/companion", {
        method: "POST",
        body: JSON.stringify({ message: "   " }),
      })
    );
    expect(response.status).toBe(400);
  });

  it("generates companion reply", async () => {
    vi.mocked(requireSession).mockResolvedValue({
      id: "user-1",
      email: "student@example.com",
      name: "Priya",
      examType: "NEET",
    });
    vi.mocked(getUserById).mockResolvedValue({
      id: "user-1",
      email: "student@example.com",
      passwordHash: "hash",
      name: "Priya",
      examType: "NEET",
      createdAt: new Date(),
    });
    vi.mocked(getChatHistory).mockResolvedValue([]);
    vi.mocked(getInsightsData).mockResolvedValue({
      entries: [],
      triggerFrequency: {},
      moodTimeline: [],
      burnoutTrend: [],
      mockScoreCorrelation: [],
      topTrigger: { name: "exam anxiety", count: 2 },
      recentBurnout: "medium",
      confidenceTrend: [],
      totalEntries: 1,
      recentWeekEntries: [],
      moodInsights: {
        weeklyAverage: 2,
        priorWeeklyAverage: null,
        delta: null,
        direction: "stable",
        byDayOfWeek: [],
        topEmotions: [],
        moodBurnoutCorrelation: { lowBurnoutAvg: null, highBurnoutAvg: null },
        lowMoodStreak: 0,
      },
    });
    vi.mocked(getLatestAnalysisSummary).mockResolvedValue(null);
    vi.mocked(generateCompanionReply).mockResolvedValue("You are not alone in this.");
    vi.mocked(saveChatMessage)
      .mockResolvedValueOnce({
        id: "msg-1",
        userId: "user-1",
        role: "user",
        content: "I'm scared about tomorrow's test",
        createdAt: new Date(),
      })
      .mockResolvedValueOnce({
        id: "msg-2",
        userId: "user-1",
        role: "assistant",
        content: "You are not alone in this.",
        createdAt: new Date(),
      });

    const response = await POST(
      new Request("http://localhost/api/companion", {
        method: "POST",
        body: JSON.stringify({ message: "I'm scared about tomorrow's test" }),
      })
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.message).toBe("You are not alone in this.");
    expect(generateCompanionReply).toHaveBeenCalledOnce();
  });
});
