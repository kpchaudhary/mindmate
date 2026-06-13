import { NextResponse } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { isSessionUser, requireSession } from "./require-session";

vi.mock("./session", () => ({
  getSession: vi.fn(),
}));

import { getSession } from "./session";

describe("requireSession", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 response when session is missing", async () => {
    vi.mocked(getSession).mockResolvedValue(null);
    const result = await requireSession();
    expect(result).toBeInstanceOf(NextResponse);
    if (result instanceof NextResponse) {
      expect(result.status).toBe(401);
    }
  });

  it("returns session user when authenticated", async () => {
    const user = {
      id: "user-1",
      email: "student@example.com",
      name: "Priya",
      examType: "NEET" as const,
      examDate: null,
      streakCount: 0,
      reminderEnabled: false,
      reminderTime: null,
      language: "en" as const,
      avatarUrl: null,
    };
    vi.mocked(getSession).mockResolvedValue(user);
    const result = await requireSession();
    expect(isSessionUser(result)).toBe(true);
    if (isSessionUser(result)) {
      expect(result.email).toBe("student@example.com");
    }
  });
});
