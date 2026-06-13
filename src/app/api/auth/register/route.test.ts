import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";

vi.mock("@/lib/db/repositories", () => ({
  createUserWithCredentials: vi.fn(),
  getUserByEmail: vi.fn(),
}));

vi.mock("@/lib/auth/password", () => ({
  hashPassword: vi.fn(),
}));

vi.mock("@/lib/auth/session", () => ({
  createUserSession: vi.fn(),
}));

import { createUserWithCredentials, getUserByEmail } from "@/lib/db/repositories";
import { hashPassword } from "@/lib/auth/password";
import { createUserSession } from "@/lib/auth/session";

describe("POST /api/auth/register", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 for invalid email", async () => {
    const response = await POST(
      new Request("http://localhost/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ email: "bad", password: "password123" }),
      })
    );
    expect(response.status).toBe(400);
  });

  it("returns 409 when email already exists", async () => {
    vi.mocked(getUserByEmail).mockResolvedValue({
      id: "1",
      email: "student@example.com",
      passwordHash: "hash",
      name: null,
      examType: null,
      createdAt: new Date(),
    });

    const response = await POST(
      new Request("http://localhost/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ email: "student@example.com", password: "password123" }),
      })
    );
    expect(response.status).toBe(409);
  });

  it("registers user successfully", async () => {
    vi.mocked(getUserByEmail).mockResolvedValue(null);
    vi.mocked(hashPassword).mockResolvedValue("hashed");
    vi.mocked(createUserWithCredentials).mockResolvedValue({
      id: "user-1",
      email: "student@example.com",
      passwordHash: "hashed",
      name: null,
      examType: null,
      createdAt: new Date(),
    });
    vi.mocked(createUserSession).mockResolvedValue("token");

    const response = await POST(
      new Request("http://localhost/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ email: "student@example.com", password: "password123" }),
      })
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.email).toBe("student@example.com");
    expect(createUserSession).toHaveBeenCalledWith("user-1");
  });
});
