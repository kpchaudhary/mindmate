import {
  journalAnalysisSchema,
  type JournalAnalysis,
  analysisResponseSchema,
  weeklySummarySchema,
  type WeeklySummary,
  weeklySummaryResponseSchema,
  STRESS_TRIGGERS,
} from "./schemas";
import type { Language } from "@/lib/db/schema";

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models";

function getModel() {
  return process.env.GEMINI_MODEL ?? "gemini-2.5-flash";
}

function getApiKey() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error("GEMINI_API_KEY is not set");
  }
  return key;
}

const SAFETY_INSTRUCTIONS = `
You are MindMate, an empathetic wellness companion for students preparing for competitive exams (NEET, JEE, CUET, CAT, GATE, UPSC).

SAFETY RULES (mandatory):
- Never diagnose medical or mental health conditions.
- Never claim the student has depression, anxiety disorder, or any clinical condition.
- Use supportive, encouraging language.
- If signs of self-harm or severe distress appear, set riskFlag to true and gently encourage reaching out to a trusted adult, counselor, or helpline.
- Provide practical, exam-context-aware wellness support only.
`.trim();

function languageInstruction(language: Language): string {
  if (language === "hi") {
    return `
LANGUAGE: Respond in Hinglish (mix of Hindi and English). Use Devanagari script for Hindi words.
Keep exam-specific terms in English (NEET, JEE, mock test, etc.).
Tone should feel natural to Indian students — warm, relatable, not overly formal.
`.trim();
  }
  return "";
}

type GeminiGenerateParams = {
  systemInstruction: string;
  userPrompt: string;
  jsonSchema?: typeof analysisResponseSchema | typeof weeklySummaryResponseSchema;
  language?: Language;
};

async function generateWithGemini({
  systemInstruction,
  userPrompt,
  jsonSchema,
  language = "en",
}: GeminiGenerateParams): Promise<string> {
  const model = getModel();
  const url = `${GEMINI_API_URL}/${model}:generateContent?key=${getApiKey()}`;

  const generationConfig: Record<string, unknown> = {
    temperature: 0.7,
    maxOutputTokens: 2048,
  };

  if (jsonSchema) {
    generationConfig.responseMimeType = "application/json";
    generationConfig.responseSchema = jsonSchema;
  }

  const langNote = languageInstruction(language);
  const fullSystemInstruction = langNote
    ? `${SAFETY_INSTRUCTIONS}\n\n${langNote}\n\n${systemInstruction}`
    : `${SAFETY_INSTRUCTIONS}\n\n${systemInstruction}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: fullSystemInstruction }],
      },
      contents: [{ role: "user", parts: [{ text: userPrompt }] }],
      generationConfig,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error: ${response.status} ${errorText}`);
  }

  const data = (await response.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error("Empty response from Gemini");
  }

  return text;
}

export type AnalysisContext = {
  studentName: string;
  examType: string;
  moodScore: number;
  journalContent: string;
  recentEntries: Array<{
    content: string;
    moodScore: number | null;
    mood: string | null;
    triggers: string[] | null;
    burnoutLevel: string | null;
  }>;
  triggerFrequency: Record<string, number>;
  language?: Language;
};

export async function analyzeJournal(context: AnalysisContext): Promise<JournalAnalysis> {
  const historySummary =
    context.recentEntries.length > 0
      ? context.recentEntries
          .map(
            (e, i) =>
              `Entry ${i + 1}: mood=${e.mood ?? "unknown"}, triggers=${JSON.stringify(e.triggers ?? [])}, excerpt="${e.content.slice(0, 120)}..."`
          )
          .join("\n")
      : "No prior entries.";

  const triggerStats = Object.entries(context.triggerFrequency)
    .filter(([, count]) => count > 0)
    .map(([trigger, count]) => `${trigger}: ${count}x`)
    .join(", ");

  const systemInstruction = `
Analyze the student's journal entry and return structured wellness insights.
Always reference their exam context (${context.examType}) and personal history when possible.
Identify stress triggers from this taxonomy when applicable: ${STRESS_TRIGGERS.join(", ")}.
Personalize coping strategy, motivation, and wellness recommendation based on patterns in their history.
Estimate burnout level (low/medium/high) with clear reasoning.
`.trim();

  const userPrompt = `
Student: ${context.studentName}
Exam: ${context.examType}
Today's mood score (1=very low, 5=great): ${context.moodScore}

Journal entry:
"""
${context.journalContent}
"""

Recent journal history:
${historySummary}

Historical trigger frequency: ${triggerStats || "none yet"}

Return JSON with: mood, emotionalPatterns, stressTriggers, copingStrategy, motivation, wellnessRecommendation, burnoutLevel, burnoutReasoning, riskFlag.
`.trim();

  const raw = await generateWithGemini({
    systemInstruction,
    userPrompt,
    jsonSchema: analysisResponseSchema,
    language: context.language,
  });

  const parsed = journalAnalysisSchema.parse(JSON.parse(raw));
  return parsed;
}

export type CompanionContext = {
  studentName: string;
  examType: string;
  message: string;
  recentTriggers: string[];
  topTrigger: string | null;
  burnoutLevel: string;
  recentRecommendation: string | null;
  chatHistory: Array<{ role: "user" | "assistant"; content: string }>;
  language?: Language;
};

export async function generateCompanionReply(context: CompanionContext): Promise<string> {
  const historyText = context.chatHistory
    .slice(-6)
    .map((m) => `${m.role}: ${m.content}`)
    .join("\n");

  const systemInstruction = `
You are MindMate, an empathetic wellness companion for ${context.studentName} preparing for ${context.examType}.
Act like a supportive therapist/coach — not a lecturer.

Conversation style:
- Validate first ("It sounds like…"), then explore, then offer one practical suggestion if appropriate
- Ask a reflective follow-up question when the student is vague, venting without clarity, or seems stuck
- Do not dump advice in the first reply unless explicitly asked for help
- Reference known stress patterns when relevant: ${context.recentTriggers.join(", ") || "none logged yet"}
- Top recurring trigger: ${context.topTrigger ?? "not enough data"}
- Current burnout estimate: ${context.burnoutLevel}
- Never diagnose. Encourage professional support if distress seems severe

Format rules (strict):
- Max 2-3 short paragraphs OR 1 short paragraph + a bullet list
- Each paragraph: 1-2 sentences max
- Use bullet lists (- item) for coping steps, grounding exercises, or options
- End with one open question when exploration would help (use judgment — not every message)
- Never output a single wall-of-text block
- Separate paragraphs with a blank line
`.trim();

  const userPrompt = `
Recent chat:
${historyText || "No prior chat."}

Latest wellness recommendation from journal analysis: ${context.recentRecommendation ?? "none yet"}

Student message:
"""
${context.message}
"""

Reply as MindMate companion.
`.trim();

  return generateWithGemini({ systemInstruction, userPrompt, language: context.language });
}

export type WeeklySummaryContext = {
  studentName: string;
  examType: string;
  entries: Array<{
    date: string;
    moodScore: number;
    mood: string;
    triggers: string[];
    burnoutLevel: string;
    content: string;
  }>;
  triggerFrequency: Record<string, number>;
  language?: Language;
};

export async function generateWeeklySummary(
  context: WeeklySummaryContext
): Promise<WeeklySummary> {
  const entriesText = context.entries
    .map(
      (e, i) =>
        `Day ${i + 1} (${e.date}): mood=${e.mood} (${e.moodScore}/5), burnout=${e.burnoutLevel}, triggers=${e.triggers.join(", ")}, excerpt="${e.content.slice(0, 100)}..."`
    )
    .join("\n");

  const triggerStats = Object.entries(context.triggerFrequency)
    .filter(([, count]) => count > 0)
    .map(([trigger, count]) => `${trigger}: ${count}x`)
    .join(", ");

  const systemInstruction = `
Summarize the student's wellness journey over the past week.
Reveal one pattern they may not have noticed themselves.
Be specific to their ${context.examType} prep context.
Keep summary to 2-3 sentences. actionableInsight should be one concrete, doable step for this week.
`.trim();

  const userPrompt = `
Student: ${context.studentName}
Exam: ${context.examType}

This week's journal entries:
${entriesText}

Trigger frequency: ${triggerStats || "none yet"}

Return JSON with: summary (2-3 sentences reviewing the week), actionableInsight (one specific action for this week).
`.trim();

  const raw = await generateWithGemini({
    systemInstruction,
    userPrompt,
    jsonSchema: weeklySummaryResponseSchema,
    language: context.language,
  });

  return weeklySummarySchema.parse(JSON.parse(raw));
}
