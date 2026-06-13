import { NextResponse } from "next/server";
import { updateProfileSchema } from "@/lib/auth/schemas";
import { isSessionUser, requireSession } from "@/lib/auth/require-session";
import { toSessionUser } from "@/lib/auth/types";
import { getUserById, updateUser } from "@/lib/db/repositories";

export async function PATCH(request: Request) {
  try {
    const sessionResult = await requireSession();
    if (!isSessionUser(sessionResult)) return sessionResult;

    const body = await request.json();
    const parsed = updateProfileSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const { name, examType, examDate, reminderEnabled, reminderTime, language } = parsed.data;
    const current = await getUserById(sessionResult.id);
    if (!current) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const updated = await updateUser(sessionResult.id, {
      name,
      examType,
      examDate:
        examDate === undefined
          ? current.examDate
          : examDate
            ? new Date(examDate)
            : null,
      reminderEnabled: reminderEnabled ?? current.reminderEnabled,
      reminderTime: reminderTime === undefined ? current.reminderTime : reminderTime,
      language: language ?? (current.language as "en" | "hi"),
    });

    return NextResponse.json(toSessionUser(updated));
  } catch (error) {
    console.error("User update error:", error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}
