import { describe, expect, it } from "vitest";
import { loginSchema, registerSchema, updateProfileSchema } from "./schemas";

describe("registerSchema", () => {
  it("accepts valid registration", () => {
    const result = registerSchema.safeParse({
      email: "student@example.com",
      password: "password123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    expect(
      registerSchema.safeParse({ email: "not-an-email", password: "password123" }).success
    ).toBe(false);
  });

  it("rejects password shorter than 8 characters", () => {
    expect(
      registerSchema.safeParse({ email: "student@example.com", password: "short" }).success
    ).toBe(false);
  });
});

describe("loginSchema", () => {
  it("accepts valid login", () => {
    expect(
      loginSchema.safeParse({ email: "student@example.com", password: "any" }).success
    ).toBe(true);
  });

  it("rejects empty password", () => {
    expect(loginSchema.safeParse({ email: "student@example.com", password: "" }).success).toBe(
      false
    );
  });
});

describe("updateProfileSchema", () => {
  it("accepts valid profile update", () => {
    expect(updateProfileSchema.safeParse({ name: "Priya", examType: "JEE" }).success).toBe(true);
  });

  it("rejects invalid exam type", () => {
    expect(updateProfileSchema.safeParse({ name: "Priya", examType: "SAT" }).success).toBe(false);
  });
});
