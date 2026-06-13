import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().trim().email().max(255),
  password: z.string().min(8).max(128),
});

export const loginSchema = z.object({
  email: z.string().trim().email().max(255),
  password: z.string().min(1).max(128),
});

export const updateProfileSchema = z.object({
  name: z.string().trim().min(1).max(80),
  examType: z.enum(["NEET", "JEE", "CUET", "CAT", "GATE", "UPSC"]),
  examDate: z.string().datetime().optional().nullable(),
  reminderEnabled: z.boolean().optional(),
  reminderTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/)
    .optional()
    .nullable(),
  language: z.enum(["en", "hi"]).optional(),
});
