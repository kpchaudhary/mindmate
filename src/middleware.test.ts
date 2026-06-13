import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";
import { SESSION_COOKIE_NAME } from "@/lib/auth/constants";
import { middleware } from "./middleware";

function createRequest(path: string, cookie?: string) {
  const headers = new Headers();
  if (cookie) {
    headers.set("cookie", `${SESSION_COOKIE_NAME}=${cookie}`);
  }
  return new NextRequest(`http://localhost:3000${path}`, { headers });
}

describe("middleware", () => {
  it("allows public auth paths without session", () => {
    const response = middleware(createRequest("/login"));
    expect(response.status).toBe(200);
  });

  it("returns 401 JSON for protected API without session", () => {
    const response = middleware(createRequest("/api/journal"));
    expect(response.status).toBe(401);
  });

  it("redirects protected pages to login with redirect param", () => {
    const response = middleware(createRequest("/insights"));
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost:3000/login?redirect=%2Finsights");
  });

  it("allows protected routes when session cookie is present", () => {
    const response = middleware(createRequest("/insights", "session-token"));
    expect(response.status).toBe(200);
  });
});
