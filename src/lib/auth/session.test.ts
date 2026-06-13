import { describe, expect, it } from "vitest";
import { generateSessionToken, hashSessionToken } from "./session";

describe("hashSessionToken", () => {
  it("returns deterministic SHA-256 hex", () => {
    const token = "test-token-value";
    const hash1 = hashSessionToken(token);
    const hash2 = hashSessionToken(token);
    expect(hash1).toBe(hash2);
    expect(hash1).toMatch(/^[a-f0-9]{64}$/);
  });
});

describe("generateSessionToken", () => {
  it("returns 64-character hex string", () => {
    const token = generateSessionToken();
    expect(token).toMatch(/^[a-f0-9]{64}$/);
  });

  it("generates unique tokens", () => {
    const token1 = generateSessionToken();
    const token2 = generateSessionToken();
    expect(token1).not.toBe(token2);
  });
});
