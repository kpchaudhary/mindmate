import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "./route";

vi.mock("@/lib/auth/session", () => ({
  getSession: vi.fn(),
}));

import { getSession } from "@/lib/auth/session";

describe("GET /api/auth/session", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when not logged in", async () => {
    vi.mocked(getSession).mockResolvedValue(null);

    const response = await GET();
    expect(response.status).toBe(401);
  });

  it("returns session user when logged in", async () => {
    vi.mocked(getSession).mockResolvedValue({
      id: "user-1",
      email: "student@example.com",
      name: "Priya",
      examType: "NEET",
      examDate: null,
      streakCount: 1,
      reminderEnabled: false,
      reminderTime: null,
      language: "en",
      avatarUrl: null,
    });

    const response = await GET();
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.email).toBe("student@example.com");
    expect(body.name).toBe("Priya");
  });
});
