import { NextResponse } from "next/server";
import { getSession } from "./session";
import type { SessionUser } from "./types";

export async function requireSession(): Promise<SessionUser | NextResponse> {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return session;
}

export function isSessionUser(result: SessionUser | NextResponse): result is SessionUser {
  return !(result instanceof NextResponse);
}
