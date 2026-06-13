import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "./password";

describe("password hashing", () => {
  it("hashes and verifies password round-trip", async () => {
    const password = "securePassword123";
    const hash = await hashPassword(password);
    expect(hash).not.toBe(password);
    expect(await verifyPassword(password, hash)).toBe(true);
  });

  it("rejects wrong password", async () => {
    const hash = await hashPassword("correctPassword");
    expect(await verifyPassword("wrongPassword", hash)).toBe(false);
  });
});
