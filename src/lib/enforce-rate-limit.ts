import { checkRateLimit, getClientIp, rateLimitResponse } from "./rate-limit";

export function enforceRateLimit(
  request: Request,
  scope: string,
  limit: number,
  windowMs: number
): Response | null {
  const ip = getClientIp(request);
  const result = checkRateLimit(`${scope}:${ip}`, limit, windowMs);
  if (!result.ok) {
    return rateLimitResponse(result.retryAfterSeconds);
  }
  return null;
}

export const RATE_LIMITS = {
  auth: { limit: 10, windowMs: 15 * 60 * 1000 },
  aiWrite: { limit: 30, windowMs: 60 * 60 * 1000 },
  aiRead: { limit: 120, windowMs: 60 * 60 * 1000 },
} as const;
