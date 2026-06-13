import { NextResponse } from "next/server";
import { changePasswordSchema } from "@/lib/auth/schemas";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { isSessionUser, requireSession } from "@/lib/auth/require-session";
import { createUserSession } from "@/lib/auth/session";
import { deleteSessionsForUser, getUserById, updateUserPassword } from "@/lib/db/repositories";

export async function POST(request: Request) {
  try {
    const sessionResult = await requireSession();
    if (!isSessionUser(sessionResult)) return sessionResult;

    const body = await request.json();
    const parsed = changePasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const user = await getUserById(sessionResult.id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { currentPassword, newPassword } = parsed.data;
    const valid = await verifyPassword(currentPassword, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Incorrect current password" }, { status: 401 });
    }

    const passwordHash = await hashPassword(newPassword);
    await updateUserPassword(sessionResult.id, passwordHash);
    await deleteSessionsForUser(sessionResult.id);
    await createUserSession(sessionResult.id);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Change password error:", error);
    return NextResponse.json({ error: "Failed to change password" }, { status: 500 });
  }
}
