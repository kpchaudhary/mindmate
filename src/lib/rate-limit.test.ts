import { describe, expect, it } from "vitest";
import { checkRateLimit } from "./rate-limit";

describe("checkRateLimit", () => {
  it("allows requests within limit", () => {
    const key = `test-${Date.now()}-allow`;
    const result = checkRateLimit(key, 3, 60_000);
    expect(result.ok).toBe(true);
  });

  it("blocks requests over limit", () => {
    const key = `test-${Date.now()}-block`;
    checkRateLimit(key, 1, 60_000);
    const result = checkRateLimit(key, 1, 60_000);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.retryAfterSeconds).toBeGreaterThan(0);
    }
  });
});
