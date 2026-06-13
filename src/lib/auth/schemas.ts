import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().trim().email().max(255),
  password: z.string().min(8).max(128),
});

export const loginSchema = z.object({
  email: z.string().trim().email().max(255),
  password: z.string().min(1).max(128),
});

const avatarUrlField = z
  .union([z.string().trim().url().max(2048), z.literal("")])
  .optional()
  .nullable()
  .transform((value) => (value === "" ? null : value));

export const updateProfileSchema = z.object({
  name: z.string().trim().min(1).max(80),
  examType: z.enum(["NEET", "JEE", "CUET", "CAT", "GATE", "UPSC"]),
  examDate: z.string().datetime().optional().nullable(),
  avatarUrl: avatarUrlField,
});

export const updatePreferencesSchema = z.object({
  reminderEnabled: z.boolean().optional(),
  reminderTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/)
    .optional()
    .nullable(),
  language: z.enum(["en", "hi"]).optional(),
});

export const updateUserSchema = z
  .object({
    name: z.string().trim().min(1).max(80).optional(),
    examType: z.enum(["NEET", "JEE", "CUET", "CAT", "GATE", "UPSC"]).optional(),
    examDate: z.string().datetime().optional().nullable(),
    avatarUrl: avatarUrlField,
    reminderEnabled: z.boolean().optional(),
    reminderTime: z
      .string()
      .regex(/^([01]\d|2[0-3]):[0-5]\d$/)
      .optional()
      .nullable(),
    language: z.enum(["en", "hi"]).optional(),
  })
  .refine((data) => Object.values(data).some((value) => value !== undefined), {
    message: "At least one field is required",
  });

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1).max(128),
  newPassword: z.string().min(8).max(128),
});
