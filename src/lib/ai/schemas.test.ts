import { describe, expect, it } from "vitest";
import {
  companionRequestSchema,
  journalAnalysisSchema,
  journalRequestSchema,
  moodSummarySchema,
  onboardingSchema,
  studyPlanAdviceRequestSchema,
  studyPlanSchema,
} from "./schemas";

describe("journalRequestSchema", () => {
  it("accepts valid journal input", () => {
    const result = journalRequestSchema.safeParse({
      content: "Studied for 8 hours today and feel exhausted.",
      moodScore: 3,
    });
    expect(result.success).toBe(true);
  });

  it("rejects content shorter than 10 characters", () => {
    const result = journalRequestSchema.safeParse({
      content: "Too short",
      moodScore: 3,
    });
    expect(result.success).toBe(false);
  });

  it("rejects mood score outside 1-5", () => {
    expect(journalRequestSchema.safeParse({ content: "Valid length content", moodScore: 0 }).success).toBe(
      false
    );
    expect(journalRequestSchema.safeParse({ content: "Valid length content", moodScore: 6 }).success).toBe(
      false
    );
  });
});

describe("journalAnalysisSchema", () => {
  const validAnalysis = {
    mood: "Anxious",
    emotionalPatterns: ["Overthinking"],
    stressTriggers: ["exam anxiety"],
    copingStrategy: "Take a short walk",
    motivation: "You are making progress",
    wellnessRecommendation: "Sleep earlier tonight",
    burnoutLevel: "medium" as const,
    burnoutReasoning: "Long study hours without breaks",
    riskFlag: false,
  };

  it("accepts complete analysis", () => {
    expect(journalAnalysisSchema.safeParse(validAnalysis).success).toBe(true);
  });

  it("rejects invalid burnout level", () => {
    expect(
      journalAnalysisSchema.safeParse({ ...validAnalysis, burnoutLevel: "critical" }).success
    ).toBe(false);
  });

  it("rejects empty emotional patterns", () => {
    expect(
      journalAnalysisSchema.safeParse({ ...validAnalysis, emotionalPatterns: [] }).success
    ).toBe(false);
  });
});

describe("onboardingSchema", () => {
  it("accepts valid onboarding data", () => {
    const result = onboardingSchema.safeParse({ name: "Priya", examType: "NEET" });
    expect(result.success).toBe(true);
  });

  it("rejects empty name", () => {
    expect(onboardingSchema.safeParse({ name: "   ", examType: "NEET" }).success).toBe(false);
  });
});

describe("companionRequestSchema", () => {
  it("accepts non-empty message", () => {
    expect(companionRequestSchema.safeParse({ message: "I feel nervous" }).success).toBe(true);
  });

  it("rejects empty message", () => {
    expect(companionRequestSchema.safeParse({ message: "   " }).success).toBe(false);
  });
});

describe("studyPlanSchema", () => {
  it("accepts valid generated plan", () => {
    const result = studyPlanSchema.safeParse({
      title: "NEET Week 1",
      rationale: "Balanced plan",
      items: [
        {
          subject: "Biology",
          topic: "Cells",
          description: "Revise chapter",
          durationMinutes: 60,
          scheduledDate: "2026-06-09",
        },
        {
          subject: "Physics",
          topic: "Mechanics",
          description: "Practice",
          durationMinutes: 90,
          scheduledDate: "2026-06-10",
        },
        {
          subject: "Chemistry",
          topic: "Organic",
          description: "Review",
          durationMinutes: 60,
          scheduledDate: "2026-06-11",
        },
      ],
    });
    expect(result.success).toBe(true);
  });
});

describe("studyPlanAdviceRequestSchema", () => {
  it("accepts advice message", () => {
    expect(
      studyPlanAdviceRequestSchema.safeParse({ message: "I feel burned out today" }).success
    ).toBe(true);
  });
});

describe("moodSummarySchema", () => {
  it("accepts mood summary output", () => {
    expect(
      moodSummarySchema.safeParse({
        patternInsight: "Mood dips on Sundays",
        correlationNote: "Lower mood aligns with high burnout days",
        gentleAction: "Take a short walk tonight",
      }).success
    ).toBe(true);
  });
});
