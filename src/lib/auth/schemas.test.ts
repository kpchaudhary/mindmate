import { describe, expect, it } from "vitest";
import {
  changePasswordSchema,
  loginSchema,
  registerSchema,
  updatePreferencesSchema,
  updateProfileSchema,
  updateUserSchema,
} from "./schemas";

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

  it("accepts valid avatar URL", () => {
    const result = updateProfileSchema.safeParse({
      name: "Priya",
      examType: "JEE",
      avatarUrl: "https://example.com/photo.jpg",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.avatarUrl).toBe("https://example.com/photo.jpg");
    }
  });

  it("transforms empty avatar URL to null", () => {
    const result = updateProfileSchema.safeParse({
      name: "Priya",
      examType: "JEE",
      avatarUrl: "",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.avatarUrl).toBeNull();
    }
  });

  it("rejects invalid avatar URL", () => {
    expect(
      updateProfileSchema.safeParse({
        name: "Priya",
        examType: "JEE",
        avatarUrl: "not-a-url",
      }).success
    ).toBe(false);
  });
});

describe("updatePreferencesSchema", () => {
  it("accepts reminder preferences", () => {
    expect(
      updatePreferencesSchema.safeParse({
        reminderEnabled: true,
        reminderTime: "20:00",
        language: "hi",
      }).success
    ).toBe(true);
  });
});

describe("updateUserSchema", () => {
  it("accepts partial profile update", () => {
    expect(updateUserSchema.safeParse({ name: "Priya" }).success).toBe(true);
  });

  it("rejects empty payload", () => {
    expect(updateUserSchema.safeParse({}).success).toBe(false);
  });
});

describe("changePasswordSchema", () => {
  it("accepts valid password change", () => {
    expect(
      changePasswordSchema.safeParse({
        currentPassword: "oldpassword",
        newPassword: "newpassword123",
      }).success
    ).toBe(true);
  });

  it("rejects short new password", () => {
    expect(
      changePasswordSchema.safeParse({
        currentPassword: "oldpassword",
        newPassword: "short",
      }).success
    ).toBe(false);
  });
});
