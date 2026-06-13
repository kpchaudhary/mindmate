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
      name: null,
      examType: null,
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
    });
    vi.mocked(getUserById).mockResolvedValue({
      id: "user-1",
      email: "student@example.com",
      passwordHash: "hash",
      name: null,
      examType: null,
      examDate: null,
      reminderEnabled: false,
      reminderTime: null,
      language: "en",
      createdAt: new Date(),
    });
    vi.mocked(updateUser).mockResolvedValue({
      id: "user-1",
      email: "student@example.com",
      passwordHash: "hash",
      name: "Priya",
      examType: "NEET",
      examDate: null,
      reminderEnabled: false,
      reminderTime: null,
      language: "en",
      createdAt: new Date(),
    });

    const response = await PATCH(
      new Request("http://localhost/api/user", {
        method: "PATCH",
        body: JSON.stringify({ name: "Priya", examType: "NEET" }),
      })
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.name).toBe("Priya");
    expect(body.examType).toBe("NEET");
  });
});
