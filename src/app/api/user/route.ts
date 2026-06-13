import { NextResponse } from "next/server";
import { updateUserSchema } from "@/lib/auth/schemas";
import { isSessionUser, requireSession } from "@/lib/auth/require-session";
import { toSessionUser } from "@/lib/auth/types";
import { getUserById, updateUser } from "@/lib/db/repositories";

export async function PATCH(request: Request) {
  try {
    const sessionResult = await requireSession();
    if (!isSessionUser(sessionResult)) return sessionResult;

    const body = await request.json();
    const parsed = updateUserSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const {
      name,
      examType,
      examDate,
      avatarUrl,
      reminderEnabled,
      reminderTime,
      language,
    } = parsed.data;
    const current = await getUserById(sessionResult.id);
    if (!current) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const updated = await updateUser(sessionResult.id, {
      ...(name !== undefined && { name }),
      ...(examType !== undefined && { examType }),
      ...(examDate !== undefined && {
        examDate: examDate ? new Date(examDate) : null,
      }),
      ...(avatarUrl !== undefined && { avatarUrl }),
      ...(reminderEnabled !== undefined && { reminderEnabled }),
      ...(reminderTime !== undefined && { reminderTime }),
      ...(language !== undefined && { language }),
    });

    return NextResponse.json(toSessionUser(updated));
  } catch (error) {
    console.error("User update error:", error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}
