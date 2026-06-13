import { NextResponse } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "./route";

vi.mock("@/lib/auth/require-session", () => ({
  requireSession: vi.fn(),
  isSessionUser: vi.fn((result) => !(result instanceof NextResponse)),
}));

vi.mock("@/lib/ai/insights-summaries", () => ({
  getCachedWeeklySummary: vi.fn(),
  getCachedMoodSummary: vi.fn(),
}));

vi.mock("@/lib/db/repositories", () => ({
  getInsightsData: vi.fn(),
  getUserById: vi.fn(),
}));

import { requireSession } from "@/lib/auth/require-session";
import { getCachedMoodSummary, getCachedWeeklySummary } from "@/lib/ai/insights-summaries";
import { getInsightsData, getUserById } from "@/lib/db/repositories";

const mockInsights = {
  triggerFrequency: { "exam anxiety": 2 },
  moodTimeline: [{ date: "2026-06-13", moodScore: 2, mood: "Anxious", burnoutLevel: "medium" }],
  burnoutTrend: [],
  mockScoreCorrelation: [],
  topTrigger: { name: "exam anxiety", count: 2 },
  recentBurnout: "medium" as const,
  confidenceTrend: [],
  totalEntries: 2,
  entries: [{ burnoutReasoning: "Long hours" }],
  recentWeekEntries: [
    {
      id: "e1",
      content: "Test entry one with enough content",
      moodScore: 2,
      mockScore: null,
      createdAt: new Date(),
      mood: "Anxious",
      emotions: ["Overthinking"],
      triggers: ["exam anxiety"],
      burnoutLevel: "medium" as const,
      burnoutReasoning: "Long hours",
      recommendation: "Rest",
      riskFlag: false,
    },
    {
      id: "e2",
      content: "Test entry two with enough content",
      moodScore: 3,
      mockScore: null,
      createdAt: new Date(),
      mood: "Okay",
      emotions: ["Hopeful"],
      triggers: ["family pressure"],
      burnoutLevel: "low" as const,
      burnoutReasoning: "Balanced",
      recommendation: "Keep going",
      riskFlag: false,
    },
  ],
  moodInsights: {
    weeklyAverage: 2.5,
    priorWeeklyAverage: null,
    delta: null,
    direction: "stable" as const,
    byDayOfWeek: [],
    topEmotions: [],
    moodBurnoutCorrelation: { lowBurnoutAvg: null, highBurnoutAvg: null },
    lowMoodStreak: 0,
  },
};

describe("GET /api/insights", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 without session", async () => {
    vi.mocked(requireSession).mockResolvedValue(
      NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    );

    const response = await GET(new Request("http://localhost/api/insights"));
    expect(response.status).toBe(401);
  });

  it("returns insights payload with cached summaries", async () => {
    vi.mocked(requireSession).mockResolvedValue({
      id: "user-1",
      email: "student@example.com",
      name: "Priya",
      examType: "NEET",
      examDate: null,
      streakCount: 1,
      reminderEnabled: false,
      reminderTime: null,
      language: "en",
      avatarUrl: null,
    });
    vi.mocked(getUserById).mockResolvedValue({
      id: "user-1",
      email: "student@example.com",
      passwordHash: "hash",
      name: "Priya",
      examType: "NEET",
      examDate: null,
      streakCount: 1,
      lastJournalDate: null,
      reminderEnabled: false,
      reminderTime: null,
      language: "en",
      avatarUrl: null,
      createdAt: new Date(),
    });
    vi.mocked(getInsightsData).mockResolvedValue(mockInsights);
    vi.mocked(getCachedWeeklySummary).mockResolvedValue({
      summary: "Weekly pattern summary",
      actionableInsight: "Take breaks",
    });
    vi.mocked(getCachedMoodSummary).mockResolvedValue({
      patternInsight: "Mood dips mid-week",
      correlationNote: "Burnout correlates with low mood",
      gentleAction: "Sleep earlier",
    });

    const response = await GET(new Request("http://localhost/api/insights"));
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.topTrigger.name).toBe("exam anxiety");
    expect(body.weeklySummary.summary).toBe("Weekly pattern summary");
    expect(body.moodSummary.patternInsight).toBe("Mood dips mid-week");
    expect(response.headers.get("Cache-Control")).toBe("private, max-age=60");
  });
});
