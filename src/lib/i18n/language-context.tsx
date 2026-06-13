"use client";

import { createContext, useContext, useMemo } from "react";
import {
  t as translate,
  type TranslationKey,
  getPromptChips,
  getExamCountdownNudge,
} from "@/lib/i18n/translations";
import type { Language } from "@/lib/db/schema";

type LanguageContextValue = {
  language: Language;
  t: (key: TranslationKey) => string;
  getPromptChips: (topTrigger: string | null) => string[];
  getExamCountdownNudge: (
    daysLeft: number,
    burnout: "low" | "medium" | "high",
    examType: string
  ) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({
  language,
  children,
}: {
  language: Language;
  children: React.ReactNode;
}) {
  const value = useMemo(
    () => ({
      language,
      t: (key: TranslationKey) => translate(key, language),
      getPromptChips: (topTrigger: string | null) => getPromptChips(topTrigger, language),
      getExamCountdownNudge: (
        daysLeft: number,
        burnout: "low" | "medium" | "high",
        examType: string
      ) => getExamCountdownNudge(daysLeft, burnout, examType, language),
    }),
    [language]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    return {
      language: "en",
      t: (key) => translate(key, "en"),
      getPromptChips: (topTrigger) => getPromptChips(topTrigger, "en"),
      getExamCountdownNudge: (daysLeft, burnout, examType) =>
        getExamCountdownNudge(daysLeft, burnout, examType, "en"),
    };
  }
  return ctx;
}
