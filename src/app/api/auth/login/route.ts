import { NextResponse } from "next/server";
import { loginSchema } from "@/lib/auth/schemas";
import { verifyPassword } from "@/lib/auth/password";
import { createUserSession } from "@/lib/auth/session";
import { toSessionUser } from "@/lib/auth/types";
import { getUserByEmail } from "@/lib/db/repositories";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const user = await getUserByEmail(parsed.data.email);
    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const valid = await verifyPassword(parsed.data.password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    await createUserSession(user.id);

    return NextResponse.json(toSessionUser(user));
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Failed to login" }, { status: 500 });
  }
}
