import { NextResponse } from "next/server";
import { registerSchema } from "@/lib/auth/schemas";
import { hashPassword } from "@/lib/auth/password";
import { createUserSession } from "@/lib/auth/session";
import { toSessionUser } from "@/lib/auth/types";
import { createUserWithCredentials, getUserByEmail } from "@/lib/db/repositories";
import { enforceRateLimit, RATE_LIMITS } from "@/lib/enforce-rate-limit";

export async function POST(request: Request) {
  const rateLimited = enforceRateLimit(request, "auth:register", RATE_LIMITS.auth.limit, RATE_LIMITS.auth.windowMs);
  if (rateLimited) return rateLimited;

  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const email = parsed.data.email.toLowerCase();
    const existing = await getUserByEmail(email);
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    const passwordHash = await hashPassword(parsed.data.password);
    const user = await createUserWithCredentials(email, passwordHash);
    await createUserSession(user.id);

    return NextResponse.json(toSessionUser(user));
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json({ error: "Failed to register" }, { status: 500 });
  }
}
