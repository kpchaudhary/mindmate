import { NextResponse } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";

vi.mock("@/lib/auth/require-session", () => ({
  requireSession: vi.fn(),
  isSessionUser: vi.fn((result) => !(result instanceof NextResponse)),
}));

vi.mock("@/lib/ai/gemini", () => ({
  getStudyPlanAdvice: vi.fn(),
}));

vi.mock("@/lib/db/repositories", () => ({
  getActiveStudyPlan: vi.fn(),
  getInsightsData: vi.fn(),
  getUserById: vi.fn(),
}));

import { requireSession } from "@/lib/auth/require-session";
import { getStudyPlanAdvice } from "@/lib/ai/gemini";
import { getActiveStudyPlan, getInsightsData, getUserById } from "@/lib/db/repositories";

describe("POST /api/study-plan/advice", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 without session", async () => {
    vi.mocked(requireSession).mockResolvedValue(
      NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    );

    const response = await POST(
      new Request("http://localhost/api/study-plan/advice", {
        method: "POST",
        body: JSON.stringify({ message: "How should I revise?" }),
      })
    );
    expect(response.status).toBe(401);
  });

  it("returns advice when plan exists", async () => {
    vi.mocked(requireSession).mockResolvedValue({
      id: "user-1",
      email: "student@example.com",
      name: "Priya",
      examType: "NEET",
      examDate: null,
      streakCount: 0,
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
      streakCount: 0,
      lastJournalDate: null,
      reminderEnabled: false,
      reminderTime: null,
      language: "en",
      avatarUrl: null,
      createdAt: new Date(),
    });
    vi.mocked(getActiveStudyPlan).mockResolvedValue({
      plan: {
        id: "plan-1",
        userId: "user-1",
        title: "Week plan",
        weekStart: new Date(),
        aiRationale: "Balanced",
        status: "active",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      items: [],
    });
    vi.mocked(getInsightsData).mockResolvedValue({
      recentWeekEntries: [{ moodScore: 3, createdAt: new Date() }],
      recentBurnout: "medium",
      topTrigger: { name: "exam anxiety", count: 1 },
      moodInsights: { lowMoodStreak: 0 },
    } as Awaited<ReturnType<typeof getInsightsData>>);
    vi.mocked(getStudyPlanAdvice).mockResolvedValue({
      advice: "Focus on weak topics first.",
      suggestedChanges: ["Shorten tomorrow's Biology block"],
    });

    const response = await POST(
      new Request("http://localhost/api/study-plan/advice", {
        method: "POST",
        body: JSON.stringify({ message: "How should I revise?" }),
      })
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.advice).toBe("Focus on weak topics first.");
  });
});
