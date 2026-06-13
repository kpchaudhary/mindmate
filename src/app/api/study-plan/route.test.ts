import { NextResponse } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET, POST } from "./route";

vi.mock("@/lib/auth/require-session", () => ({
  requireSession: vi.fn(),
  isSessionUser: vi.fn((result) => !(result instanceof NextResponse)),
}));

vi.mock("@/lib/ai/gemini", () => ({
  generateStudyPlan: vi.fn(),
}));

vi.mock("@/lib/db/repositories", () => ({
  getActiveStudyPlan: vi.fn(),
  createStudyPlanWithItems: vi.fn(),
  getInsightsData: vi.fn(),
  getUserById: vi.fn(),
  startOfWeek: vi.fn(() => new Date("2026-06-09T00:00:00.000Z")),
}));

import { requireSession } from "@/lib/auth/require-session";
import { generateStudyPlan } from "@/lib/ai/gemini";
import {
  createStudyPlanWithItems,
  getActiveStudyPlan,
  getInsightsData,
  getUserById,
} from "@/lib/db/repositories";

const mockPlan = {
  plan: {
    id: "plan-1",
    userId: "user-1",
    title: "NEET Week 1",
    weekStart: new Date("2026-06-09T00:00:00.000Z"),
    aiRationale: "Lighter load due to high burnout.",
    status: "active" as const,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  items: [
    {
      id: "item-1",
      planId: "plan-1",
      subject: "Biology",
      topic: "Cell structure",
      description: "Revise NCERT chapter 8",
      durationMinutes: 90,
      scheduledDate: new Date("2026-06-09T09:00:00.000Z"),
      status: "pending" as const,
      sortOrder: 0,
      isUserEdited: false,
      createdAt: new Date(),
    },
  ],
};

describe("GET /api/study-plan", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 without session", async () => {
    vi.mocked(requireSession).mockResolvedValue(
      NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    );

    const response = await GET();
    expect(response.status).toBe(401);
  });

  it("returns empty plan when none exists", async () => {
    vi.mocked(requireSession).mockResolvedValue({
      id: "user-1",
      email: "student@example.com",
      name: "Priya",
      examType: "NEET",
      language: "en",
    });
    vi.mocked(getActiveStudyPlan).mockResolvedValue(null);

    const response = await GET();
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.plan).toBeNull();
    expect(body.progress.total).toBe(0);
  });

  it("returns active plan with progress", async () => {
    vi.mocked(requireSession).mockResolvedValue({
      id: "user-1",
      email: "student@example.com",
      name: "Priya",
      examType: "NEET",
      language: "en",
    });
    vi.mocked(getActiveStudyPlan).mockResolvedValue(mockPlan);

    const response = await GET();
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.plan.title).toBe("NEET Week 1");
    expect(body.progress.total).toBe(1);
  });
});

describe("POST /api/study-plan", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("generates and stores a study plan", async () => {
    vi.mocked(requireSession).mockResolvedValue({
      id: "user-1",
      email: "student@example.com",
      name: "Priya",
      examType: "NEET",
      language: "en",
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
      createdAt: new Date(),
    });
    vi.mocked(getInsightsData).mockResolvedValue({
      entries: [],
      triggerFrequency: {},
      moodTimeline: [],
      burnoutTrend: [],
      mockScoreCorrelation: [],
      topTrigger: null,
      recentBurnout: "high",
      confidenceTrend: [],
      totalEntries: 0,
      recentWeekEntries: [],
      moodInsights: {
        weeklyAverage: 2,
        priorWeeklyAverage: null,
        delta: null,
        direction: "declining",
        byDayOfWeek: [],
        topEmotions: [],
        moodBurnoutCorrelation: { lowBurnoutAvg: null, highBurnoutAvg: 2 },
        lowMoodStreak: 2,
      },
    });
    vi.mocked(generateStudyPlan).mockResolvedValue({
      title: "NEET Recovery Week",
      rationale: "Reduced load because burnout is high.",
      items: [
        {
          subject: "Biology",
          topic: "Cell structure",
          description: "Light revision",
          durationMinutes: 60,
          scheduledDate: "2026-06-09",
        },
        {
          subject: "Physics",
          topic: "Mechanics",
          description: "Practice problems",
          durationMinutes: 90,
          scheduledDate: "2026-06-10",
        },
        {
          subject: "Chemistry",
          topic: "Organic basics",
          description: "Formula review",
          durationMinutes: 60,
          scheduledDate: "2026-06-11",
        },
      ],
    });
    vi.mocked(createStudyPlanWithItems).mockResolvedValue(mockPlan);

    const response = await POST(
      new Request("http://localhost/api/study-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      })
    );

    expect(response.status).toBe(200);
    expect(generateStudyPlan).toHaveBeenCalledOnce();
    expect(createStudyPlanWithItems).toHaveBeenCalledOnce();
    const body = await response.json();
    expect(body.plan.title).toBe("NEET Week 1");
  });
});
