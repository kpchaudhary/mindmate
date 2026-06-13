import { NextResponse } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";

vi.mock("@/lib/auth/require-session", () => ({
  requireSession: vi.fn(),
  isSessionUser: vi.fn((result) => !(result instanceof NextResponse)),
}));

vi.mock("@/lib/auth/password", () => ({
  hashPassword: vi.fn(async (password: string) => `hashed:${password}`),
  verifyPassword: vi.fn(async (password: string) => password === "correct-password"),
}));

vi.mock("@/lib/auth/session", () => ({
  createUserSession: vi.fn(),
}));

vi.mock("@/lib/db/repositories", () => ({
  getUserById: vi.fn(),
  updateUserPassword: vi.fn(),
  deleteSessionsForUser: vi.fn(),
}));

import { requireSession } from "@/lib/auth/require-session";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { createUserSession } from "@/lib/auth/session";
import { deleteSessionsForUser, getUserById, updateUserPassword } from "@/lib/db/repositories";

describe("POST /api/auth/change-password", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 for incorrect current password", async () => {
    vi.mocked(requireSession).mockResolvedValue({
      id: "user-1",
      email: "student@example.com",
      name: "Priya",
      examType: "NEET",
      examDate: null,
      streakCount: 0,
      reminderEnabled: false,
      reminderTime: null,
      language: "en",
      avatarUrl: null,
    });
    vi.mocked(getUserById).mockResolvedValue({
      id: "user-1",
      email: "student@example.com",
      passwordHash: "hash",
      name: "Priya",
      examType: "NEET",
      examDate: null,
      streakCount: 0,
      lastJournalDate: null,
      reminderEnabled: false,
      reminderTime: null,
      language: "en",
      avatarUrl: null,
      createdAt: new Date(),
    });

    const response = await POST(
      new Request("http://localhost/api/auth/change-password", {
        method: "POST",
        body: JSON.stringify({
          currentPassword: "wrong-password",
          newPassword: "newpassword123",
        }),
      })
    );

    expect(response.status).toBe(401);
    expect(verifyPassword).toHaveBeenCalledWith("wrong-password", "hash");
    expect(updateUserPassword).not.toHaveBeenCalled();
  });

  it("updates password on success", async () => {
    vi.mocked(requireSession).mockResolvedValue({
      id: "user-1",
      email: "student@example.com",
      name: "Priya",
      examType: "NEET",
      examDate: null,
      streakCount: 0,
      reminderEnabled: false,
      reminderTime: null,
      language: "en",
      avatarUrl: null,
    });
    vi.mocked(getUserById).mockResolvedValue({
      id: "user-1",
      email: "student@example.com",
      passwordHash: "hash",
      name: "Priya",
      examType: "NEET",
      examDate: null,
      streakCount: 0,
      lastJournalDate: null,
      reminderEnabled: false,
      reminderTime: null,
      language: "en",
      avatarUrl: null,
      createdAt: new Date(),
    });

    const response = await POST(
      new Request("http://localhost/api/auth/change-password", {
        method: "POST",
        body: JSON.stringify({
          currentPassword: "correct-password",
          newPassword: "newpassword123",
        }),
      })
    );

    expect(response.status).toBe(200);
    expect(hashPassword).toHaveBeenCalledWith("newpassword123");
    expect(updateUserPassword).toHaveBeenCalledWith("user-1", "hashed:newpassword123");
    expect(deleteSessionsForUser).toHaveBeenCalledWith("user-1");
    expect(createUserSession).toHaveBeenCalledWith("user-1");
    const body = await response.json();
    expect(body.ok).toBe(true);
  });
});
