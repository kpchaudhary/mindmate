import { describe, expect, it } from "vitest";
import { isSafeRedirect, resolveRedirectPath } from "./safe-redirect";

describe("isSafeRedirect", () => {
  it("accepts valid internal paths", () => {
    expect(isSafeRedirect("/insights")).toBe(true);
    expect(isSafeRedirect("/journal/history")).toBe(true);
    expect(isSafeRedirect("/companion")).toBe(true);
  });

  it("rejects open redirects", () => {
    expect(isSafeRedirect("//evil.com")).toBe(false);
    expect(isSafeRedirect("/\\evil.com")).toBe(false);
    expect(isSafeRedirect("https://evil.com")).toBe(false);
    expect(isSafeRedirect(null)).toBe(false);
    expect(isSafeRedirect("")).toBe(false);
  });

  it("rejects auth pages", () => {
    expect(isSafeRedirect("/login")).toBe(false);
    expect(isSafeRedirect("/register")).toBe(false);
    expect(isSafeRedirect("/login?redirect=/insights")).toBe(false);
  });

  it("rejects paths with invalid characters", () => {
    expect(isSafeRedirect("/insights?tab=1")).toBe(false);
    expect(isSafeRedirect("/insights#section")).toBe(false);
  });
});

describe("resolveRedirectPath", () => {
  it("returns safe redirect or fallback", () => {
    expect(resolveRedirectPath("/journal", "/insights")).toBe("/journal");
    expect(resolveRedirectPath("//evil.com", "/insights")).toBe("/insights");
    expect(resolveRedirectPath(null, "/insights")).toBe("/insights");
  });
});
