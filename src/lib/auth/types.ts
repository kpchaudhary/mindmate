import type { ExamType, Language } from "@/lib/db/schema";

export type SessionUser = {
  id: string;
  email: string;
  name: string | null;
  examType: ExamType | null;
  examDate: string | null;
  streakCount: number;
  reminderEnabled: boolean;
  reminderTime: string | null;
  language: Language;
};

export function isProfileComplete(
  user: SessionUser
): user is SessionUser & { name: string; examType: ExamType } {
  return Boolean(user.name && user.examType);
}

export function toSessionUser(user: {
  id: string;
  email: string;
  name: string | null;
  examType: string | null;
  examDate?: Date | null;
  streakCount?: number | null;
  reminderEnabled?: boolean | null;
  reminderTime?: string | null;
  language?: string | null;
}): SessionUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    examType: user.examType as ExamType | null,
    examDate: user.examDate?.toISOString() ?? null,
    streakCount: user.streakCount ?? 0,
    reminderEnabled: user.reminderEnabled ?? false,
    reminderTime: user.reminderTime ?? null,
    language: (user.language === "hi" ? "hi" : "en") as Language,
  };
}
