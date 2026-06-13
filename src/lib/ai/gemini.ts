import {
  journalAnalysisSchema,
  type JournalAnalysis,
  analysisResponseSchema,
  weeklySummarySchema,
  type WeeklySummary,
  weeklySummaryResponseSchema,
  studyPlanSchema,
  type StudyPlanGeneration,
  studyPlanResponseSchema,
  studyPlanAdviceSchema,
  type StudyPlanAdvice,
  studyPlanAdviceResponseSchema,
  moodSummarySchema,
  type MoodSummary,
  moodSummaryResponseSchema,
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

type GeminiJsonSchema =
  | typeof analysisResponseSchema
  | typeof weeklySummaryResponseSchema
  | typeof studyPlanResponseSchema
  | typeof studyPlanAdviceResponseSchema
  | typeof moodSummaryResponseSchema;

type GeminiGenerateParams = {
  systemInstruction: string;
  userPrompt: string;
  jsonSchema?: GeminiJsonSchema;
  language?: Language;
  maxOutputTokens?: number;
};

async function generateWithGemini({
  systemInstruction,
  userPrompt,
  jsonSchema,
  language = "en",
  maxOutputTokens = 2048,
}: GeminiGenerateParams): Promise<string> {
  const model = getModel();
  const url = `${GEMINI_API_URL}/${model}:generateContent`;

  const generationConfig: Record<string, unknown> = {
    temperature: 0.7,
    maxOutputTokens,
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
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": getApiKey(),
    },
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
    candidates?: Array<{
      content?: { parts?: Array<{ text?: string }> };
      finishReason?: string;
    }>;
  };

  const candidate = data.candidates?.[0];
  const text = candidate?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error("Empty response from Gemini");
  }

  if (candidate?.finishReason === "MAX_TOKENS") {
    throw new Error("Gemini response truncated (MAX_TOKENS)");
  }

  return text;
}

function parseGeminiJson<T>(raw: string, schema: { parse: (value: unknown) => T }): T {
  try {
    return schema.parse(JSON.parse(raw));
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(`Invalid JSON from Gemini: ${error.message}`);
    }
    throw error;
  }
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

  return parseGeminiJson(raw, journalAnalysisSchema);
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

  return parseGeminiJson(raw, weeklySummarySchema);
}

export type StudyPlanContext = {
  studentName: string;
  examType: string;
  daysToExam: number | null;
  focusNote?: string;
  recentBurnout: string;
  avgMoodScore: number | null;
  topTrigger: string | null;
  lowMoodStreak: number;
  weekStartDate: string;
  language?: Language;
};

export async function generateStudyPlan(context: StudyPlanContext): Promise<StudyPlanGeneration> {
  const intensityNote =
    context.recentBurnout === "high" || context.lowMoodStreak >= 2
      ? "Reduce daily study hours, include lighter revision and breaks. Student shows signs of burnout or low mood."
      : context.recentBurnout === "medium"
        ? "Moderate intensity with built-in rest blocks."
        : "Standard productive schedule is fine.";

  const systemInstruction = `
You are MindMate's study coach for ${context.studentName} preparing for ${context.examType}.
Create a practical 7-day study plan — not therapy, not wellness advice.
Use exam-specific subjects (e.g. NEET: Physics, Chemistry, Biology; JEE: Physics, Chemistry, Maths).
${intensityNote}
Each day should have 2-3 focused tasks (14-21 tasks total). Total daily study time should match wellness state.
Keep each task description to one short sentence (under 20 words).
Explain in rationale how mood/burnout influenced the plan intensity (2-3 sentences max).
`.trim();

  const userPrompt = `
Exam: ${context.examType}
Days to exam: ${context.daysToExam ?? "unknown"}
Week starting: ${context.weekStartDate}
Recent burnout: ${context.recentBurnout}
Average mood (1-5): ${context.avgMoodScore ?? "no data"}
Top stress trigger: ${context.topTrigger ?? "none logged"}
Low mood streak (recent entries ≤2): ${context.lowMoodStreak}
Student focus note: ${context.focusNote ?? "none"}

Return JSON with:
- title: short plan title
- rationale: 2-3 sentences explaining the plan and how wellness context shaped it
- items: array of tasks with subject, topic, description, durationMinutes (15-240), scheduledDate (YYYY-MM-DD within the 7-day window starting ${context.weekStartDate})
`.trim();

  const raw = await generateWithGemini({
    systemInstruction,
    userPrompt,
    jsonSchema: studyPlanResponseSchema,
    language: context.language,
    maxOutputTokens: 8192,
  });

  return parseGeminiJson(raw, studyPlanSchema);
}

export type StudyPlanAdviceContext = {
  studentName: string;
  examType: string;
  message: string;
  planTitle: string;
  pendingItems: Array<{ subject: string; topic: string; scheduledDate: string; durationMinutes: number }>;
  recentBurnout: string;
  avgMoodScore: number | null;
  language?: Language;
};

export async function getStudyPlanAdvice(
  context: StudyPlanAdviceContext
): Promise<StudyPlanAdvice> {
  const tasksText = context.pendingItems
    .slice(0, 10)
    .map(
      (item) =>
        `- ${item.scheduledDate}: ${item.subject} — ${item.topic} (${item.durationMinutes} min)`
    )
    .join("\n");

  const systemInstruction = `
You are MindMate's study coach helping ${context.studentName} adjust their ${context.examType} study plan.
Be practical: suggest which tasks to skip, defer, shorten, or swap for lighter alternatives.
Reference their burnout level (${context.recentBurnout}) and mood when relevant.
Keep advice supportive but focused on study scheduling, not therapy.
`.trim();

  const userPrompt = `
Current plan: ${context.planTitle}
Pending tasks:
${tasksText || "No pending tasks"}

Recent average mood: ${context.avgMoodScore ?? "unknown"}/5
Burnout: ${context.recentBurnout}

Student message:
"""
${context.message}
"""

Return JSON with advice (2-3 short paragraphs) and suggestedChanges (2-4 bullet-style actionable changes).
`.trim();

  const raw = await generateWithGemini({
    systemInstruction,
    userPrompt,
    jsonSchema: studyPlanAdviceResponseSchema,
    language: context.language,
  });

  return parseGeminiJson(raw, studyPlanAdviceSchema);
}

export type MoodSummaryContext = {
  studentName: string;
  examType: string;
  moodTimeline: Array<{ date: string; moodScore: number; mood: string | null; burnoutLevel: string | null }>;
  byDayOfWeek: Array<{ day: string; average: number | null }>;
  topEmotions: Array<{ emotion: string; count: number }>;
  moodBurnoutCorrelation: { lowBurnoutAvg: number | null; highBurnoutAvg: number | null };
  direction: string;
  weeklyAverage: number | null;
  language?: Language;
};

export async function generateMoodSummary(context: MoodSummaryContext): Promise<MoodSummary> {
  const timelineText = context.moodTimeline
    .slice(-7)
    .map((e) => `${e.date}: mood ${e.moodScore}/5 (${e.mood ?? "unknown"}), burnout ${e.burnoutLevel ?? "unknown"}`)
    .join("\n");

  const dayPattern = context.byDayOfWeek
    .filter((d) => d.average !== null)
    .map((d) => `${d.day}: avg ${d.average}/5`)
    .join(", ");

  const emotionsText = context.topEmotions.map((e) => `${e.emotion} (${e.count}x)`).join(", ");

  const systemInstruction = `
Analyze mood patterns for ${context.studentName} preparing for ${context.examType}.
Reveal something non-obvious — a day-of-week dip, emotion-burnout link, or trend they may not notice.
Never diagnose. Be warm and specific to their data.
`.trim();

  const userPrompt = `
Recent mood entries:
${timelineText || "none"}

Mood by day of week: ${dayPattern || "insufficient data"}
Top emotions: ${emotionsText || "none yet"}
Weekly average: ${context.weeklyAverage ?? "unknown"}/5, trend: ${context.direction}
Mood when burnout low: ${context.moodBurnoutCorrelation.lowBurnoutAvg ?? "unknown"}/5
Mood when burnout high: ${context.moodBurnoutCorrelation.highBurnoutAvg ?? "unknown"}/5

Return JSON with patternInsight, correlationNote, gentleAction (one small doable step).
`.trim();

  const raw = await generateWithGemini({
    systemInstruction,
    userPrompt,
    jsonSchema: moodSummaryResponseSchema,
    language: context.language,
  });

  return parseGeminiJson(raw, moodSummarySchema);
}
