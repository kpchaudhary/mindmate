import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";

vi.mock("@/lib/db/repositories", () => ({
  getUserByEmail: vi.fn(),
}));

vi.mock("@/lib/auth/password", () => ({
  verifyPassword: vi.fn(),
}));

vi.mock("@/lib/auth/session", () => ({
  createUserSession: vi.fn(),
}));

import { getUserByEmail } from "@/lib/db/repositories";
import { verifyPassword } from "@/lib/auth/password";
import { createUserSession } from "@/lib/auth/session";

describe("POST /api/auth/login", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 for invalid input", async () => {
    const response = await POST(
      new Request("http://localhost/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: "bad", password: "" }),
      })
    );
    expect(response.status).toBe(400);
  });

  it("returns 401 for unknown user", async () => {
    vi.mocked(getUserByEmail).mockResolvedValue(null);

    const response = await POST(
      new Request("http://localhost/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: "student@example.com", password: "password123" }),
      })
    );
    expect(response.status).toBe(401);
  });

  it("returns 401 for wrong password", async () => {
    vi.mocked(getUserByEmail).mockResolvedValue({
      id: "1",
      email: "student@example.com",
      passwordHash: "hash",
      name: "Priya",
      examType: "NEET",
      createdAt: new Date(),
    });
    vi.mocked(verifyPassword).mockResolvedValue(false);

    const response = await POST(
      new Request("http://localhost/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: "student@example.com", password: "wrong" }),
      })
    );
    expect(response.status).toBe(401);
  });

  it("logs in successfully", async () => {
    vi.mocked(getUserByEmail).mockResolvedValue({
      id: "user-1",
      email: "student@example.com",
      passwordHash: "hash",
      name: "Priya",
      examType: "NEET",
      createdAt: new Date(),
    });
    vi.mocked(verifyPassword).mockResolvedValue(true);
    vi.mocked(createUserSession).mockResolvedValue("token");

    const response = await POST(
      new Request("http://localhost/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: "student@example.com", password: "password123" }),
      })
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.name).toBe("Priya");
    expect(createUserSession).toHaveBeenCalledWith("user-1");
  });
});
