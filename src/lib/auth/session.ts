import { createHash, randomBytes } from "crypto";
import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME } from "@/lib/auth/constants";
import {
  createSession as createSessionRow,
  deleteSession as deleteSessionRow,
  getSessionByTokenHash,
} from "@/lib/db/repositories";
import { toSessionUser, type SessionUser } from "./types";

const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000;

export { SESSION_COOKIE_NAME } from "@/lib/auth/constants";

export function hashSessionToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function generateSessionToken(): string {
  return randomBytes(32).toString("hex");
}

export async function createUserSession(userId: string): Promise<string> {
  const token = generateSessionToken();
  const tokenHash = hashSessionToken(token);
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  await createSessionRow(userId, tokenHash, expiresAt);

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });

  return token;
}

export async function getSessionTokenFromCookies(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE_NAME)?.value ?? null;
}

export async function getSession(): Promise<SessionUser | null> {
  const token = await getSessionTokenFromCookies();
  if (!token) return null;

  const tokenHash = hashSessionToken(token);
  const row = await getSessionByTokenHash(tokenHash);
  if (!row) return null;

  if (row.expiresAt < new Date()) {
    await deleteSessionRow(tokenHash);
    return null;
  }

  return toSessionUser({
    id: row.userId,
    email: row.email,
    name: row.name,
    examType: row.examType,
    examDate: row.examDate,
    streakCount: row.streakCount,
    reminderEnabled: row.reminderEnabled,
    reminderTime: row.reminderTime,
    language: row.language,
  });
}

export async function destroySession(): Promise<void> {
  const token = await getSessionTokenFromCookies();
  const cookieStore = await cookies();

  if (token) {
    await deleteSessionRow(hashSessionToken(token));
  }

  cookieStore.delete(SESSION_COOKIE_NAME);
}
