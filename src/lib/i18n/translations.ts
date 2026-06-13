import type { Language } from "@/lib/db/schema";

export type TranslationKey =
  | "nav.dashboard"
  | "nav.journal"
  | "nav.studyPlan"
  | "nav.companion"
  | "nav.profile"
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
  | "dashboard.loadError"
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
  | "journal.pageSubtitle"
  | "journal.moodVeryLow"
  | "journal.moodLow"
  | "journal.moodOkay"
  | "journal.moodGood"
  | "journal.moodGreat"
  | "journal.placeholder"
  | "journal.pastEntries"
  | "journal.emptyHistory"
  | "journal.historyError"
  | "journal.oneEntry"
  | "journal.entryCount"
  | "journal.analyzeError"
  | "journal.yourEntry"
  | "journal.entryInsight"
  | "journal.burnoutLow"
  | "journal.burnoutMedium"
  | "journal.burnoutHigh"
  | "journal.riskAlert"
  | "companion.title"
  | "companion.subtitle"
  | "companion.placeholder"
  | "companion.empty"
  | "companion.sendError"
  | "companion.dismiss"
  | "companion.openSheet"
  | "settings.title"
  | "settings.examDate"
  | "settings.examDateHint"
  | "settings.reminder"
  | "settings.reminderTime"
  | "settings.language"
  | "settings.save"
  | "profile.title"
  | "profile.details"
  | "profile.name"
  | "profile.exam"
  | "profile.examDate"
  | "profile.examDateHint"
  | "profile.avatarUrl"
  | "profile.avatarUrlHint"
  | "profile.save"
  | "profile.saving"
  | "profile.saved"
  | "profile.saveError"
  | "profile.changePassword"
  | "profile.changePasswordHint"
  | "profile.currentPassword"
  | "profile.newPassword"
  | "profile.confirmPassword"
  | "profile.updatePassword"
  | "profile.changingPassword"
  | "profile.passwordChanged"
  | "profile.passwordWrong"
  | "profile.passwordMismatch"
  | "profile.passwordChangeError"
  | "profile.edit"
  | "profile.cancel"
  | "profile.email"
  | "profile.password"
  | "profile.notSet"
  | "profile.customPhoto"
  | "profile.usingInitials"
  | "onboarding.pageTitle"
  | "onboarding.pageSubtitle"
  | "onboarding.welcome"
  | "onboarding.almostThere"
  | "onboarding.step1Description"
  | "onboarding.step2Description"
  | "onboarding.namePlaceholder"
  | "onboarding.examPlaceholder"
  | "onboarding.continue"
  | "onboarding.back"
  | "onboarding.start"
  | "onboarding.settingUp"
  | "onboarding.error"
  | "onboarding.toastDescription"
  | "onboarding.examDate"
  | "onboarding.examDateOptional"
  | "dashboard.moodInsights"
  | "dashboard.moodTrend"
  | "dashboard.moodTrendImproving"
  | "dashboard.moodTrendStable"
  | "dashboard.moodTrendDeclining"
  | "dashboard.moodByDay"
  | "dashboard.topEmotions"
  | "dashboard.moodPattern"
  | "dashboard.moodCorrelation"
  | "dashboard.moodAction"
  | "dashboard.weeklyAverage"
  | "studyPlan.title"
  | "studyPlan.subtitle"
  | "studyPlan.emptyTitle"
  | "studyPlan.emptyDescription"
  | "studyPlan.generate"
  | "studyPlan.generating"
  | "studyPlan.regenerate"
  | "studyPlan.regenerating"
  | "studyPlan.regenerateConfirm"
  | "studyPlan.progress"
  | "studyPlan.tasksDone"
  | "studyPlan.weekOf"
  | "studyPlan.aiRationale"
  | "studyPlan.noTasks"
  | "studyPlan.editTask"
  | "studyPlan.subject"
  | "studyPlan.topic"
  | "studyPlan.description"
  | "studyPlan.duration"
  | "studyPlan.saveTask"
  | "studyPlan.adviceTitle"
  | "studyPlan.adviceDescription"
  | "studyPlan.advicePlaceholder"
  | "studyPlan.adviceError"
  | "studyPlan.loadError"
  | "studyPlan.generateError"

const en: Record<TranslationKey, string> = {
  "nav.dashboard": "Dashboard",
  "nav.journal": "Journal",
  "nav.studyPlan": "Study Plan",
  "nav.companion": "Companion",
  "nav.profile": "Profile",
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
  "dashboard.loadError": "Could not load your dashboard. Check your connection and try again.",
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
  "journal.pageSubtitle": "Write freely — MindMate analyzes patterns standard trackers miss.",
  "journal.moodVeryLow": "Very low",
  "journal.moodLow": "Low",
  "journal.moodOkay": "Okay",
  "journal.moodGood": "Good",
  "journal.moodGreat": "Great",
  "journal.placeholder":
    "I studied for 8 hours but still feel behind. Mock test scores dropped and my parents asked about ranks...",
  "journal.pastEntries": "Past entries",
  "journal.emptyHistory": "Your journal history will appear here after your first check-in.",
  "journal.historyError": "Could not load your journal history.",
  "journal.oneEntry": "1 journal entry",
  "journal.entryCount": "{count} journal entries",
  "journal.analyzeError": "Could not analyze your journal. Please try again.",
  "journal.yourEntry": "Your entry",
  "journal.entryInsight": "AI insight",
  "journal.burnoutLow": "Low burnout",
  "journal.burnoutMedium": "Medium burnout",
  "journal.burnoutHigh": "High burnout",
  "journal.riskAlert": "Alert",
  "companion.title": "MindMate Companion",
  "companion.subtitle": "Context-aware support for your",
  "companion.placeholder": "I'm anxious about tomorrow's mock test...",
  "companion.empty":
    "I'm here whenever prep feels overwhelming. Ask me for a coping strategy, a quick mindfulness exercise, or just vent about today.",
  "companion.sendError": "Could not send message. Please try again.",
  "companion.dismiss": "Dismiss",
  "companion.openSheet": "Open companion chat",
  "settings.title": "Settings",
  "settings.examDate": "Exam date",
  "settings.examDateHint": "Optional — enables countdown on dashboard",
  "settings.reminder": "Daily journal reminder",
  "settings.reminderTime": "Reminder time",
  "settings.language": "Language",
  "settings.save": "Save changes",
  "profile.title": "Profile",
  "profile.details": "Profile details",
  "profile.name": "Your name",
  "profile.exam": "Exam",
  "profile.examDate": "Exam date",
  "profile.examDateHint": "Optional — enables countdown on dashboard",
  "profile.avatarUrl": "Profile image URL",
  "profile.avatarUrlHint": "Paste a link to your photo — leave blank to use initials",
  "profile.save": "Save profile",
  "profile.saving": "Saving...",
  "profile.saved": "Profile updated",
  "profile.saveError": "Could not save profile",
  "profile.changePassword": "Change password",
  "profile.changePasswordHint": "Use at least 8 characters for your new password.",
  "profile.currentPassword": "Current password",
  "profile.newPassword": "New password",
  "profile.confirmPassword": "Confirm new password",
  "profile.updatePassword": "Update password",
  "profile.changingPassword": "Updating...",
  "profile.passwordChanged": "Password updated",
  "profile.passwordWrong": "Current password is incorrect",
  "profile.passwordMismatch": "New passwords do not match",
  "profile.passwordChangeError": "Could not change password",
  "profile.edit": "Edit profile",
  "profile.cancel": "Cancel",
  "profile.email": "Email",
  "profile.password": "Password",
  "profile.notSet": "Not set",
  "profile.customPhoto": "Custom photo",
  "profile.usingInitials": "Using initials",
  "onboarding.pageTitle": "Set up your profile",
  "onboarding.pageSubtitle":
    "Tell us a bit about yourself so MindMate can personalize your wellness insights.",
  "onboarding.welcome": "Welcome to MindMate",
  "onboarding.almostThere": "Almost there",
  "onboarding.step1Description": "Tell us your name to personalize your wellness journey.",
  "onboarding.step2Description": "Select your exam so MindMate can tailor insights to your prep.",
  "onboarding.namePlaceholder": "e.g. Aarav",
  "onboarding.examPlaceholder": "Select exam",
  "onboarding.continue": "Continue",
  "onboarding.back": "Back",
  "onboarding.start": "Start my wellness journey",
  "onboarding.settingUp": "Setting up...",
  "onboarding.error": "Something went wrong. Please try again.",
  "onboarding.toastDescription": "Your dashboard is ready.",
  "onboarding.examDate": "When is your exam?",
  "onboarding.examDateOptional": "Optional — you can add this later in settings",
  "dashboard.moodInsights": "Mood Insights",
  "dashboard.moodTrend": "Mood trend",
  "dashboard.moodTrendImproving": "Improving",
  "dashboard.moodTrendStable": "Stable",
  "dashboard.moodTrendDeclining": "Declining",
  "dashboard.moodByDay": "Mood by Day of Week",
  "dashboard.topEmotions": "Top Emotions",
  "dashboard.moodPattern": "Pattern discovered",
  "dashboard.moodCorrelation": "Mood & burnout link",
  "dashboard.moodAction": "Gentle next step",
  "dashboard.weeklyAverage": "Weekly average",
  "studyPlan.title": "Study Plan",
  "studyPlan.subtitle": "AI-personalized weekly schedule adapted to your mood and burnout",
  "studyPlan.emptyTitle": "Generate your study plan",
  "studyPlan.emptyDescription":
    "MindMate builds a 7-day plan based on your exam, countdown, and wellness patterns.",
  "studyPlan.generate": "Generate my plan",
  "studyPlan.generating": "Building your plan...",
  "studyPlan.regenerate": "Regenerate week",
  "studyPlan.regenerating": "Regenerating...",
  "studyPlan.regenerateConfirm": "Replace your current plan with a new AI-generated week?",
  "studyPlan.progress": "Weekly progress",
  "studyPlan.tasksDone": "tasks done",
  "studyPlan.weekOf": "Week of",
  "studyPlan.aiRationale": "Why this plan",
  "studyPlan.noTasks": "No tasks in this plan yet.",
  "studyPlan.editTask": "Edit task",
  "studyPlan.subject": "Subject",
  "studyPlan.topic": "Topic",
  "studyPlan.description": "Description",
  "studyPlan.duration": "Duration (minutes)",
  "studyPlan.saveTask": "Save task",
  "studyPlan.adviceTitle": "Plan adjustment help",
  "studyPlan.adviceDescription": "Ask MindMate how to adjust today's plan based on how you feel.",
  "studyPlan.advicePlaceholder": "I feel burned out today...",
  "studyPlan.adviceError": "Could not get plan advice. Try again.",
  "studyPlan.loadError": "Could not load your study plan.",
  "studyPlan.generateError": "Could not generate your study plan. Please try again.",
};

const hi: Record<TranslationKey, string> = {
  "nav.dashboard": "डैशबोर्ड",
  "nav.journal": "जर्नल",
  "nav.studyPlan": "स्टडी प्लान",
  "nav.companion": "साथी",
  "nav.profile": "प्रोफ़ाइल",
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
  "dashboard.loadError": "डैशबोर्ड लोड नहीं हो सका। कनेक्शन जांचें और फिर कोशिश करें।",
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
  "journal.pageSubtitle": "खुलकर लिखें — MindMate वो पैटर्न खोजता है जो सामान्य ट्रैकर नहीं देखते।",
  "journal.moodVeryLow": "बहुत कम",
  "journal.moodLow": "कम",
  "journal.moodOkay": "ठीक",
  "journal.moodGood": "अच्छा",
  "journal.moodGreat": "बहुत अच्छा",
  "journal.placeholder":
    "8 घंटे पढ़ा लेकिन अभी भी पीछे लग रहा है। Mock scores गिरे और माता-पिता ranks पूछ रहे हैं...",
  "journal.pastEntries": "पिछली एंट्री",
  "journal.emptyHistory": "पहली चेक-इन के बाद आपका जर्नल इतिहास यहाँ दिखेगा।",
  "journal.historyError": "जर्नल इतिहास लोड नहीं हो सका।",
  "journal.oneEntry": "1 जर्नल एंट्री",
  "journal.entryCount": "{count} जर्नल एंट्री",
  "journal.analyzeError": "जर्नल विश्लेषण नहीं हो सका। फिर कोशिश करें।",
  "journal.yourEntry": "आपकी एंट्री",
  "journal.entryInsight": "AI विश्लेषण",
  "journal.burnoutLow": "कम burnout",
  "journal.burnoutMedium": "मध्यम burnout",
  "journal.burnoutHigh": "उच्च burnout",
  "journal.riskAlert": "चेतावनी",
  "companion.title": "MindMate साथी",
  "companion.subtitle": "आपकी",
  "companion.placeholder": "कल के mock test को लेकर चिंता है...",
  "companion.empty":
    "जब भी प्रेप भारी लगे, मैं यहाँ हूँ। coping strategy, mindfulness exercise, या बस आज की बात — कुछ भी पूछें।",
  "companion.sendError": "मैसेज नहीं भेजा जा सका। फिर कोशिश करें।",
  "companion.dismiss": "बंद करें",
  "companion.openSheet": "साथी चैट खोलें",
  "settings.title": "सेटिंग्स",
  "settings.examDate": "एग्जाम की तारीख",
  "settings.examDateHint": "वैकल्पिक — डैशबोर्ड पर काउंटडाउन दिखेगा",
  "settings.reminder": "दैनिक जर्नल रिमाइंडर",
  "settings.reminderTime": "रिमाइंडर का समय",
  "settings.language": "भाषा",
  "settings.save": "बदलाव सहेजें",
  "profile.title": "प्रोफ़ाइल",
  "profile.details": "प्रोफ़ाइल विवरण",
  "profile.name": "आपका नाम",
  "profile.exam": "एग्जाम",
  "profile.examDate": "एग्जाम की तारीख",
  "profile.examDateHint": "वैकल्पिक — डैशबोर्ड पर काउंटडाउन दिखेगा",
  "profile.avatarUrl": "प्रोफ़ाइल फोटो URL",
  "profile.avatarUrlHint": "अपनी फोटो का लिंक पेस्ट करें — खाली छोड़ने पर initials दिखेंगे",
  "profile.save": "प्रोफ़ाइल सहेजें",
  "profile.saving": "सहेज रहे हैं...",
  "profile.saved": "प्रोफ़ाइल अपडेट हो गई",
  "profile.saveError": "प्रोफ़ाइल सहेज नहीं सके",
  "profile.changePassword": "पासवर्ड बदलें",
  "profile.changePasswordHint": "नए पासवर्ड के लिए कम से कम 8 अक्षर इस्तेमाल करें।",
  "profile.currentPassword": "वर्तमान पासवर्ड",
  "profile.newPassword": "नया पासवर्ड",
  "profile.confirmPassword": "नया पासवर्ड दोबारा",
  "profile.updatePassword": "पासवर्ड अपडेट करें",
  "profile.changingPassword": "अपडेट हो रहा है...",
  "profile.passwordChanged": "पासवर्ड अपडेट हो गया",
  "profile.passwordWrong": "वर्तमान पासवर्ड गलत है",
  "profile.passwordMismatch": "नए पासवर्ड मेल नहीं खाते",
  "profile.passwordChangeError": "पासवर्ड बदल नहीं सके",
  "profile.edit": "प्रोफ़ाइल संपादित करें",
  "profile.cancel": "रद्द करें",
  "profile.email": "ईमेल",
  "profile.password": "पासवर्ड",
  "profile.notSet": "सेट नहीं",
  "profile.customPhoto": "कस्टम फोटो",
  "profile.usingInitials": "Initials इस्तेमाल हो रहे हैं",
  "onboarding.pageTitle": "अपनी प्रोफ़ाइल सेट करें",
  "onboarding.pageSubtitle":
    "MindMate को अपने बारे में बताएं ताकि wellness insights आपके लिए personalize हों।",
  "onboarding.welcome": "MindMate में आपका स्वागत है",
  "onboarding.almostThere": "लगभग हो गया",
  "onboarding.step1Description": "अपना नाम बताएं ताकि wellness journey personalize हो सके।",
  "onboarding.step2Description": "अपना एग्जाम चुनें ताकि insights आपकी तैयारी के अनुसार हों।",
  "onboarding.namePlaceholder": "जैसे आरव",
  "onboarding.examPlaceholder": "एग्जाम चुनें",
  "onboarding.continue": "आगे बढ़ें",
  "onboarding.back": "वापस",
  "onboarding.start": "अपनी wellness journey शुरू करें",
  "onboarding.settingUp": "सेट अप हो रहा है...",
  "onboarding.error": "कुछ गलत हो गया। फिर कोशिश करें।",
  "onboarding.toastDescription": "आपका डैशबोर्ड तैयार है।",
  "onboarding.examDate": "आपका एग्जाम कब है?",
  "onboarding.examDateOptional": "वैकल्पिक — बाद में सेटिंग्स में जोड़ सकते हैं",
  "dashboard.moodInsights": "मूड इनसाइट्स",
  "dashboard.moodTrend": "मूड ट्रेंड",
  "dashboard.moodTrendImproving": "सुधर रहा है",
  "dashboard.moodTrendStable": "स्थिर",
  "dashboard.moodTrendDeclining": "गिर रहा है",
  "dashboard.moodByDay": "सप्ताह के दिनों में मूड",
  "dashboard.topEmotions": "मुख्य भावनाएँ",
  "dashboard.moodPattern": "पैटर्न मिला",
  "dashboard.moodCorrelation": "मूड और बर्नआउट संबंध",
  "dashboard.moodAction": "हल्का अगला कदम",
  "dashboard.weeklyAverage": "साप्ताहिक औसत",
  "studyPlan.title": "स्टडी प्लान",
  "studyPlan.subtitle": "आपके मूड और बर्नआउट के अनुसार AI साप्ताहिक शेड्यूल",
  "studyPlan.emptyTitle": "अपना स्टडी प्लान बनाएं",
  "studyPlan.emptyDescription":
    "MindMate आपके एग्जाम, काउंटडाउन और wellness पैटर्न से 7-दिन का प्लान बनाता है।",
  "studyPlan.generate": "प्लान बनाएं",
  "studyPlan.generating": "प्लान बन रहा है...",
  "studyPlan.regenerate": "हफ्ता दोबारा बनाएं",
  "studyPlan.regenerating": "दोबारा बन रहा है...",
  "studyPlan.regenerateConfirm": "मौजूदा प्लान को नए AI प्लान से बदलें?",
  "studyPlan.progress": "साप्ताहिक प्रगति",
  "studyPlan.tasksDone": "टास्क पूरे",
  "studyPlan.weekOf": "हफ्ता",
  "studyPlan.aiRationale": "यह प्लान क्यों",
  "studyPlan.noTasks": "इस प्लान में अभी कोई टास्क नहीं।",
  "studyPlan.editTask": "टास्क संपादित करें",
  "studyPlan.subject": "विषय",
  "studyPlan.topic": "टॉपिक",
  "studyPlan.description": "विवरण",
  "studyPlan.duration": "अवधि (मिनट)",
  "studyPlan.saveTask": "टास्क सहेजें",
  "studyPlan.adviceTitle": "प्लान एडजस्टमेंट मदद",
  "studyPlan.adviceDescription": "MindMate से पूछें कि आज का प्लान कैसे बदलें।",
  "studyPlan.advicePlaceholder": "आज बहुत burnout feel हो रहा है...",
  "studyPlan.adviceError": "प्लान advice नहीं मिली। फिर कोशिश करें।",
  "studyPlan.loadError": "स्टडी प्लान लोड नहीं हो सका।",
  "studyPlan.generateError": "स्टडी प्लान नहीं बन सका। फिर कोशिश करें।",
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

const JOURNAL_PROMPT_CHIPS: Record<Language, string[]> = {
  en: [
    "Studied hard today but still feel behind on syllabus...",
    "Mock test went worse than expected and I'm losing confidence...",
    "Feeling guilty about taking a break when everyone else is grinding...",
  ],
  hi: [
    "आज बहुत पढ़ा लेकिन syllabus अभी भी पीछे लग रहा है...",
    "Mock test उम्मीद से कम गया, confidence टूट रहा है...",
    "Break लेने पर guilt हो रहा है जब सब grind कर रहे हैं...",
  ],
};

export function getJournalPromptChips(language: Language): string[] {
  return JOURNAL_PROMPT_CHIPS[language];
}

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
