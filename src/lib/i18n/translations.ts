import type { Language } from "@/lib/db/schema";

export type TranslationKey =
  | "nav.dashboard"
  | "nav.journal"
  | "nav.companion"
  | "dashboard.greeting"
  | "dashboard.subtitle"
  | "dashboard.totalEntries"
  | "dashboard.currentBurnout"
  | "dashboard.topTrigger"
  | "dashboard.hiddenPattern"
  | "dashboard.moodTimeline"
  | "dashboard.triggerFrequency"
  | "dashboard.confidenceTrend"
  | "dashboard.burnoutEstimate"
  | "dashboard.burnoutTrend"
  | "dashboard.weeklySummary"
  | "dashboard.actionableInsight"
  | "dashboard.examCountdown"
  | "dashboard.daysLeft"
  | "dashboard.streak"
  | "dashboard.streakDays"
  | "dashboard.mockScoreCorrelation"
  | "dashboard.writeJournal"
  | "dashboard.openCompanion"
  | "dashboard.emptyWelcome"
  | "dashboard.emptyDescription"
  | "journal.title"
  | "journal.description"
  | "journal.moodToday"
  | "journal.whatsOnMind"
  | "journal.mockScore"
  | "journal.mockScoreHint"
  | "journal.analyze"
  | "journal.analyzing"
  | "journal.voice"
  | "journal.voiceStart"
  | "journal.voiceStop"
  | "journal.voiceListening"
  | "journal.voiceUnsupported"
  | "journal.voicePermission"
  | "journal.voiceNoSpeech"
  | "journal.voiceFailed"
  | "companion.title"
  | "companion.subtitle"
  | "companion.placeholder"
  | "companion.empty"
  | "settings.title"
  | "settings.examDate"
  | "settings.examDateHint"
  | "settings.reminder"
  | "settings.reminderTime"
  | "settings.language"
  | "settings.save"
  | "onboarding.examDate"
  | "onboarding.examDateOptional";

const en: Record<TranslationKey, string> = {
  "nav.dashboard": "Dashboard",
  "nav.journal": "Journal",
  "nav.companion": "Companion",
  "dashboard.greeting": "Good morning",
  "dashboard.subtitle": "prep dashboard — patterns and trends from your journals.",
  "dashboard.totalEntries": "Total entries",
  "dashboard.currentBurnout": "Current burnout",
  "dashboard.topTrigger": "Top trigger",
  "dashboard.hiddenPattern": "Hidden Pattern Discovered",
  "dashboard.moodTimeline": "Mood Timeline",
  "dashboard.triggerFrequency": "Stress Trigger Frequency",
  "dashboard.confidenceTrend": "Confidence Trend",
  "dashboard.burnoutEstimate": "Current Burnout Estimate",
  "dashboard.burnoutTrend": "Burnout Trend (14 days)",
  "dashboard.weeklySummary": "Your Week in Review",
  "dashboard.actionableInsight": "This week's action",
  "dashboard.examCountdown": "Exam countdown",
  "dashboard.daysLeft": "days left",
  "dashboard.streak": "Journal streak",
  "dashboard.streakDays": "days in a row",
  "dashboard.mockScoreCorrelation": "Mock Score vs Mood",
  "dashboard.writeJournal": "Write journal",
  "dashboard.openCompanion": "Open companion",
  "dashboard.emptyWelcome": "Welcome to your dashboard",
  "dashboard.emptyDescription":
    "Once you submit your first journal entry, MindMate will surface mood trends, stress patterns, and burnout estimates here.",
  "journal.title": "Daily Check-in",
  "journal.description":
    "Share how you're feeling today. MindMate will uncover patterns standard trackers miss.",
  "journal.moodToday": "Mood today",
  "journal.whatsOnMind": "What's on your mind?",
  "journal.mockScore": "Mock test score (optional)",
  "journal.mockScoreHint": "0–100, helps track score vs mood",
  "journal.analyze": "Analyze my journal",
  "journal.analyzing": "Analyzing with AI...",
  "journal.voice": "Voice",
  "journal.voiceStart": "Start voice journal",
  "journal.voiceStop": "Stop recording",
  "journal.voiceListening": "Listening… speak freely, tap Stop when done",
  "journal.voiceUnsupported": "Voice input works in Chrome and Safari on mobile/desktop",
  "journal.voicePermission": "Microphone access denied. Allow mic permission in browser settings.",
  "journal.voiceNoSpeech": "No speech detected. Try again and speak clearly.",
  "journal.voiceFailed": "Voice input failed. Type your journal instead.",
  "companion.title": "MindMate Companion",
  "companion.subtitle": "Context-aware support for your",
  "companion.placeholder": "I'm anxious about tomorrow's mock test...",
  "companion.empty":
    "I'm here whenever prep feels overwhelming. Ask me for a coping strategy, a quick mindfulness exercise, or just vent about today.",
  "settings.title": "Settings",
  "settings.examDate": "Exam date",
  "settings.examDateHint": "Optional — enables countdown on dashboard",
  "settings.reminder": "Daily journal reminder",
  "settings.reminderTime": "Reminder time",
  "settings.language": "Language",
  "settings.save": "Save changes",
  "onboarding.examDate": "When is your exam?",
  "onboarding.examDateOptional": "Optional — you can add this later in settings",
};

const hi: Record<TranslationKey, string> = {
  "nav.dashboard": "डैशबोर्ड",
  "nav.journal": "जर्नल",
  "nav.companion": "साथी",
  "dashboard.greeting": "नमस्ते",
  "dashboard.subtitle": "प्रेप डैशबोर्ड — आपके जर्नल से पैटर्न और ट्रेंड।",
  "dashboard.totalEntries": "कुल एंट्री",
  "dashboard.currentBurnout": "वर्तमान बर्नआउट",
  "dashboard.topTrigger": "मुख्य ट्रिगर",
  "dashboard.hiddenPattern": "छिपा हुआ पैटर्न मिला",
  "dashboard.moodTimeline": "मूड टाइमलाइन",
  "dashboard.triggerFrequency": "तनाव ट्रिगर की आवृत्ति",
  "dashboard.confidenceTrend": "आत्मविश्वास ट्रेंड",
  "dashboard.burnoutEstimate": "वर्तमान बर्नआउट अनुमान",
  "dashboard.burnoutTrend": "बर्नआउट ट्रेंड (14 दिन)",
  "dashboard.weeklySummary": "आपका साप्ताहिक सारांश",
  "dashboard.actionableInsight": "इस हफ्ते का एक्शन",
  "dashboard.examCountdown": "एग्जाम काउंटडाउन",
  "dashboard.daysLeft": "दिन बाकी",
  "dashboard.streak": "जर्नल स्ट्रीक",
  "dashboard.streakDays": "लगातार दिन",
  "dashboard.mockScoreCorrelation": "मॉक स्कोर बनाम मूड",
  "dashboard.writeJournal": "जर्नल लिखें",
  "dashboard.openCompanion": "साथी खोलें",
  "dashboard.emptyWelcome": "आपके डैशबोर्ड में स्वागत है",
  "dashboard.emptyDescription":
    "पहली जर्नल एंट्री के बाद, MindMate यहाँ मूड ट्रेंड, तनाव पैटर्न और बर्नआउट दिखाएगा।",
  "journal.title": "दैनिक चेक-इन",
  "journal.description":
    "आज आप कैसा महसूस कर रहे हैं, बताएं। MindMate वो पैटर्न खोजेगा जो सामान्य ट्रैकर नहीं देखते।",
  "journal.moodToday": "आज का मूड",
  "journal.whatsOnMind": "आपके मन में क्या है?",
  "journal.mockScore": "मॉक टेस्ट स्कोर (वैकल्पिक)",
  "journal.mockScoreHint": "0–100, स्कोर और मूड का सहसंबंध",
  "journal.analyze": "मेरा जर्नल विश्लेषण करें",
  "journal.analyzing": "AI से विश्लेषण हो रहा है...",
  "journal.voice": "आवाज़",
  "journal.voiceStart": "वॉइस जर्नल शुरू करें",
  "journal.voiceStop": "रिकॉर्डिंग बंद करें",
  "journal.voiceListening": "सुन रहे हैं… बोलें, हो जाए तो Stop दबाएं",
  "journal.voiceUnsupported": "वॉइस Chrome या Safari में mobile/desktop पर काम करता है",
  "journal.voicePermission": "माइक की permission नहीं मिली। browser settings में allow करें।",
  "journal.voiceNoSpeech": "आवाज़ नहीं सुनाई दी। फिर से बोलें।",
  "journal.voiceFailed": "वॉइस input fail हुआ। टाइप करके लिखें।",
  "companion.title": "MindMate साथी",
  "companion.subtitle": "आपकी",
  "companion.placeholder": "कल के mock test को लेकर चिंता है...",
  "companion.empty":
    "जब भी प्रेप भारी लगे, मैं यहाँ हूँ। coping strategy, mindfulness exercise, या बस आज की बात — कुछ भी पूछें।",
  "settings.title": "सेटिंग्स",
  "settings.examDate": "एग्जाम की तारीख",
  "settings.examDateHint": "वैकल्पिक — डैशबोर्ड पर काउंटडाउन दिखेगा",
  "settings.reminder": "दैनिक जर्नल रिमाइंडर",
  "settings.reminderTime": "रिमाइंडर का समय",
  "settings.language": "भाषा",
  "settings.save": "बदलाव सहेजें",
  "onboarding.examDate": "आपका एग्जाम कब है?",
  "onboarding.examDateOptional": "वैकल्पिक — बाद में सेटिंग्स में जोड़ सकते हैं",
};

const translations: Record<Language, Record<TranslationKey, string>> = { en, hi };

export function t(key: TranslationKey, language: Language = "en"): string {
  return translations[language][key] ?? translations.en[key];
}

export const TRIGGER_PROMPT_CHIPS: Record<string, { en: string; hi: string }> = {
  "exam anxiety": {
    en: "I'm anxious about tomorrow's mock test",
    hi: "कल के mock test को लेकर बहुत anxiety है",
  },
  "family pressure": {
    en: "Help me deal with pressure from my parents",
    hi: "माता-पिता के दबाव से कैसे निपटूँ?",
  },
  "social comparison": {
    en: "I feel behind compared to my friends",
    hi: "दोस्तों से पीछे महसूस हो रहा है",
  },
  burnout: {
    en: "Help me recover after a long study day",
    hi: "लंबे study day के बाद recovery में मदद करो",
  },
  "sleep issues": {
    en: "I can't sleep because of exam stress",
    hi: "एग्जाम stress की वजह से नींद नहीं आ रही",
  },
  "confidence issues": {
    en: "My mock scores dropped and I feel hopeless",
    hi: "Mock scores गिर गए, confidence टूट रहा है",
  },
};

export function getPromptChips(
  topTrigger: string | null,
  language: Language
): string[] {
  const defaults = [
    TRIGGER_PROMPT_CHIPS["exam anxiety"][language],
    TRIGGER_PROMPT_CHIPS.burnout[language],
    TRIGGER_PROMPT_CHIPS["social comparison"][language],
  ];

  if (!topTrigger || !TRIGGER_PROMPT_CHIPS[topTrigger]) {
    return defaults;
  }

  const primary = TRIGGER_PROMPT_CHIPS[topTrigger][language];
  const others = Object.entries(TRIGGER_PROMPT_CHIPS)
    .filter(([key]) => key !== topTrigger)
    .slice(0, 2)
    .map(([, v]) => v[language]);

  return [primary, ...others];
}

export function getExamCountdownNudge(
  daysLeft: number,
  burnout: "low" | "medium" | "high",
  examType: string,
  language: Language
): string {
  if (language === "hi") {
    if (daysLeft <= 7) {
      return burnout === "high"
        ? `${daysLeft} दिन ${examType} तक — आज rest लो, burnout high है।`
        : `${daysLeft} दिन ${examType} तक — focused revision, पर breaks भी लो।`;
    }
    return burnout === "high"
      ? `${daysLeft} दिन ${examType} तक — pace maintain करो, burnout बढ़ रहा है।`
      : `${daysLeft} दिन ${examType} तक — steady progress, आप सही track पर हैं।`;
  }

  if (daysLeft <= 7) {
    return burnout === "high"
      ? `${daysLeft} days to ${examType} — prioritize rest today; burnout is high.`
      : `${daysLeft} days to ${examType} — focused revision, but take breaks too.`;
  }
  return burnout === "high"
    ? `${daysLeft} days to ${examType} — maintain pace, but burnout is rising.`
    : `${daysLeft} days to ${examType} — steady progress, you're on track.`;
}
