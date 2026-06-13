import { NextResponse } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";

vi.mock("@/lib/auth/require-session", () => ({
  requireSession: vi.fn(),
  isSessionUser: vi.fn((result) => !(result instanceof NextResponse)),
}));

vi.mock("@/lib/ai/gemini", () => ({
  analyzeJournal: vi.fn(),
}));

vi.mock("@/lib/db/repositories", () => ({
  createJournalWithAnalysis: vi.fn(),
  getRecentJournalContext: vi.fn(),
  getTriggerFrequency: vi.fn(),
  getUserById: vi.fn(),
  updateStreakOnJournal: vi.fn(),
}));

import { requireSession } from "@/lib/auth/require-session";
import { analyzeJournal } from "@/lib/ai/gemini";
import {
  createJournalWithAnalysis,
  getRecentJournalContext,
  getTriggerFrequency,
  getUserById,
  updateStreakOnJournal,
} from "@/lib/db/repositories";

const mockAnalysis = {
  mood: "Anxious",
  emotionalPatterns: ["Overthinking"],
  stressTriggers: ["exam anxiety"],
  copingStrategy: "Take a break",
  motivation: "Keep going",
  wellnessRecommendation: "Sleep early",
  burnoutLevel: "medium" as const,
  burnoutReasoning: "Long hours",
  riskFlag: false,
};

describe("POST /api/journal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 without session", async () => {
    vi.mocked(requireSession).mockResolvedValue(
      NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    );

    const response = await POST(
      new Request("http://localhost/api/journal", {
        method: "POST",
        body: JSON.stringify({ content: "Valid journal entry text", moodScore: 3 }),
      })
    );
    expect(response.status).toBe(401);
  });

  it("returns 400 for short journal content", async () => {
    vi.mocked(requireSession).mockResolvedValue({
      id: "user-1",
      email: "student@example.com",
      name: "Priya",
      examType: "NEET",
      language: "en",
    });

    const response = await POST(
      new Request("http://localhost/api/journal", {
        method: "POST",
        body: JSON.stringify({ content: "short", moodScore: 3 }),
      })
    );
    expect(response.status).toBe(400);
  });

  it("returns 400 for incomplete profile", async () => {
    vi.mocked(requireSession).mockResolvedValue({
      id: "user-1",
      email: "student@example.com",
      name: null,
      examType: null,
    });
    vi.mocked(getUserById).mockResolvedValue({
      id: "user-1",
      email: "student@example.com",
      passwordHash: "hash",
      name: null,
      examType: null,
      createdAt: new Date(),
    });

    const response = await POST(
      new Request("http://localhost/api/journal", {
        method: "POST",
        body: JSON.stringify({
          content: "Studied all day but still feel behind on syllabus.",
          moodScore: 2,
        }),
      })
    );
    expect(response.status).toBe(400);
  });

  it("analyzes and persists journal entry", async () => {
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
      language: "en",
      createdAt: new Date(),
    });
    vi.mocked(getRecentJournalContext).mockResolvedValue([]);
    vi.mocked(getTriggerFrequency).mockResolvedValue({ "exam anxiety": 1 });
    vi.mocked(analyzeJournal).mockResolvedValue(mockAnalysis);
    vi.mocked(createJournalWithAnalysis).mockResolvedValue({
      entry: {
        id: "entry-1",
        userId: "user-1",
        content: "Studied all day",
        moodScore: 2,
        mockScore: null,
        createdAt: new Date(),
      },
      analysis: {
        id: "analysis-1",
        entryId: "entry-1",
        mood: mockAnalysis.mood,
        emotions: mockAnalysis.emotionalPatterns,
        triggers: mockAnalysis.stressTriggers,
        copingStrategy: mockAnalysis.copingStrategy,
        motivation: mockAnalysis.motivation,
        recommendation: mockAnalysis.wellnessRecommendation,
        burnoutLevel: mockAnalysis.burnoutLevel,
        burnoutReasoning: mockAnalysis.burnoutReasoning,
        riskFlag: mockAnalysis.riskFlag,
        raw: null,
        createdAt: new Date(),
      },
    });

    vi.mocked(updateStreakOnJournal).mockResolvedValue(3);

    const response = await POST(
      new Request("http://localhost/api/journal", {
        method: "POST",
        body: JSON.stringify({
          content: "Studied all day but still feel behind on syllabus.",
          moodScore: 2,
        }),
      })
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.entryId).toBe("entry-1");
    expect(body.analysis.mood).toBe("Anxious");
    expect(analyzeJournal).toHaveBeenCalledOnce();
    expect(createJournalWithAnalysis).toHaveBeenCalledOnce();
  });
});
