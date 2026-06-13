import { z } from "zod";

export const STRESS_TRIGGERS = [
  "exam anxiety",
  "family pressure",
  "social comparison",
  "burnout",
  "sleep issues",
  "confidence issues",
] as const;

export const journalAnalysisSchema = z.object({
  mood: z.string().min(1),
  emotionalPatterns: z.array(z.string()).min(1),
  stressTriggers: z.array(z.string()).min(1),
  copingStrategy: z.string().min(1),
  motivation: z.string().min(1),
  wellnessRecommendation: z.string().min(1),
  burnoutLevel: z.enum(["low", "medium", "high"]),
  burnoutReasoning: z.string().min(1),
  riskFlag: z.boolean(),
});

export type JournalAnalysis = z.infer<typeof journalAnalysisSchema>;

export const weeklySummarySchema = z.object({
  summary: z.string().min(1),
  actionableInsight: z.string().min(1),
});

export type WeeklySummary = z.infer<typeof weeklySummarySchema>;

export const onboardingSchema = z.object({
  name: z.string().trim().min(1).max(80),
  examType: z.enum(["NEET", "JEE", "CUET", "CAT", "GATE", "UPSC"]),
  examDate: z.string().datetime().optional().nullable(),
});

export const journalRequestSchema = z.object({
  content: z.string().trim().min(10).max(5000),
  moodScore: z.number().int().min(1).max(5),
  mockScore: z.number().int().min(0).max(100).optional().nullable(),
});

export const companionRequestSchema = z.object({
  message: z.string().trim().min(1).max(2000),
});

export const analysisResponseSchema = {
  type: "object",
  properties: {
    mood: { type: "string" },
    emotionalPatterns: { type: "array", items: { type: "string" } },
    stressTriggers: { type: "array", items: { type: "string" } },
    copingStrategy: { type: "string" },
    motivation: { type: "string" },
    wellnessRecommendation: { type: "string" },
    burnoutLevel: { type: "string", enum: ["low", "medium", "high"] },
    burnoutReasoning: { type: "string" },
    riskFlag: { type: "boolean" },
  },
  required: [
    "mood",
    "emotionalPatterns",
    "stressTriggers",
    "copingStrategy",
    "motivation",
    "wellnessRecommendation",
    "burnoutLevel",
    "burnoutReasoning",
    "riskFlag",
  ],
} as const;

export const weeklySummaryResponseSchema = {
  type: "object",
  properties: {
    summary: { type: "string" },
    actionableInsight: { type: "string" },
  },
  required: ["summary", "actionableInsight"],
} as const;
