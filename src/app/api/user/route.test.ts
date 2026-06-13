import { NextResponse } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PATCH } from "./route";

vi.mock("@/lib/auth/require-session", () => ({
  requireSession: vi.fn(),
  isSessionUser: vi.fn((result) => !(result instanceof NextResponse)),
}));

vi.mock("@/lib/db/repositories", () => ({
  getUserById: vi.fn(),
  updateUser: vi.fn(),
}));

import { requireSession } from "@/lib/auth/require-session";
import { updateUser, getUserById } from "@/lib/db/repositories";

describe("PATCH /api/user", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 for invalid exam type", async () => {
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

    const response = await PATCH(
      new Request("http://localhost/api/user", {
        method: "PATCH",
        body: JSON.stringify({ name: "Priya", examType: "INVALID" }),
      })
    );
    expect(response.status).toBe(400);
  });

  it("updates user profile", async () => {
    vi.mocked(requireSession).mockResolvedValue({
      id: "user-1",
      email: "student@example.com",
      name: null,
      examType: null,
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
      name: null,
      examType: null,
      examDate: null,
      streakCount: 0,
      lastJournalDate: null,
      reminderEnabled: false,
      reminderTime: null,
      language: "en",
      avatarUrl: null,
      createdAt: new Date(),
    });
    vi.mocked(updateUser).mockResolvedValue({
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
      avatarUrl: "https://example.com/photo.jpg",
      createdAt: new Date(),
    });

    const response = await PATCH(
      new Request("http://localhost/api/user", {
        method: "PATCH",
        body: JSON.stringify({
          name: "Priya",
          examType: "NEET",
          avatarUrl: "https://example.com/photo.jpg",
        }),
      })
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.name).toBe("Priya");
    expect(body.examType).toBe("NEET");
    expect(body.avatarUrl).toBe("https://example.com/photo.jpg");
  });

  it("updates preferences only", async () => {
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
    vi.mocked(updateUser).mockResolvedValue({
      id: "user-1",
      email: "student@example.com",
      passwordHash: "hash",
      name: "Priya",
      examType: "NEET",
      examDate: null,
      streakCount: 0,
      lastJournalDate: null,
      reminderEnabled: true,
      reminderTime: "21:00",
      language: "hi",
      avatarUrl: null,
      createdAt: new Date(),
    });

    const response = await PATCH(
      new Request("http://localhost/api/user", {
        method: "PATCH",
        body: JSON.stringify({
          reminderEnabled: true,
          reminderTime: "21:00",
          language: "hi",
        }),
      })
    );

    expect(response.status).toBe(200);
    expect(updateUser).toHaveBeenCalledWith("user-1", {
      reminderEnabled: true,
      reminderTime: "21:00",
      language: "hi",
    });
  });
});
