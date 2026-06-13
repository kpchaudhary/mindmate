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

export const studyPlanGenerateRequestSchema = z.object({
  focusNote: z.string().trim().max(500).optional(),
});

export const studyPlanItemPatchSchema = z.object({
  id: z.string().uuid(),
  subject: z.string().trim().min(1).max(100).optional(),
  topic: z.string().trim().min(1).max(200).optional(),
  description: z.string().trim().min(1).max(1000).optional(),
  durationMinutes: z.number().int().min(15).max(480).optional(),
  scheduledDate: z.string().datetime().optional(),
  status: z.enum(["pending", "done"]).optional(),
});

export const studyPlanItemCreateSchema = z.object({
  planId: z.string().uuid(),
  subject: z.string().trim().min(1).max(100),
  topic: z.string().trim().min(1).max(200),
  description: z.string().trim().min(1).max(1000),
  durationMinutes: z.number().int().min(15).max(480),
  scheduledDate: z.string().datetime(),
});

export const studyPlanItemDeleteSchema = z.object({
  id: z.string().uuid(),
});

export const studyPlanAdviceRequestSchema = z.object({
  message: z.string().trim().min(1).max(2000),
});

export const studyPlanSchema = z.object({
  title: z.string().min(1),
  rationale: z.string().min(1),
  items: z
    .array(
      z.object({
        subject: z.string().min(1),
        topic: z.string().min(1),
        description: z.string().min(1),
        durationMinutes: z.number().int().min(15).max(480),
        scheduledDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      })
    )
    .min(3)
    .max(21),
});

export type StudyPlanGeneration = z.infer<typeof studyPlanSchema>;

export const studyPlanAdviceSchema = z.object({
  advice: z.string().min(1),
  suggestedChanges: z.array(z.string()).min(1).max(5),
});

export type StudyPlanAdvice = z.infer<typeof studyPlanAdviceSchema>;

export const moodSummarySchema = z.object({
  patternInsight: z.string().min(1),
  correlationNote: z.string().min(1),
  gentleAction: z.string().min(1),
});

export type MoodSummary = z.infer<typeof moodSummarySchema>;

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

export const studyPlanResponseSchema = {
  type: "object",
  properties: {
    title: { type: "string" },
    rationale: { type: "string" },
    items: {
      type: "array",
      items: {
        type: "object",
        properties: {
          subject: { type: "string" },
          topic: { type: "string" },
          description: { type: "string" },
          durationMinutes: { type: "integer" },
          scheduledDate: { type: "string" },
        },
        required: ["subject", "topic", "description", "durationMinutes", "scheduledDate"],
      },
    },
  },
  required: ["title", "rationale", "items"],
} as const;

export const studyPlanAdviceResponseSchema = {
  type: "object",
  properties: {
    advice: { type: "string" },
    suggestedChanges: { type: "array", items: { type: "string" } },
  },
  required: ["advice", "suggestedChanges"],
} as const;

export const moodSummaryResponseSchema = {
  type: "object",
  properties: {
    patternInsight: { type: "string" },
    correlationNote: { type: "string" },
    gentleAction: { type: "string" },
  },
  required: ["patternInsight", "correlationNote", "gentleAction"],
} as const;
