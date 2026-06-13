import { unstable_cache } from "next/cache";
import {
  generateWeeklySummary,
  generateMoodSummary,
  type WeeklySummaryContext,
  type MoodSummaryContext,
} from "./gemini";

function getWeekCacheKey(date = new Date()): string {
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(date);
  monday.setDate(diff);
  monday.setHours(0, 0, 0, 0);
  return monday.toISOString().slice(0, 10);
}

export async function getCachedWeeklySummary(userId: string, params: WeeklySummaryContext) {
  const cacheKey = `${userId}:${getWeekCacheKey()}`;
  return unstable_cache(
    async () => generateWeeklySummary(params),
    ["weekly-summary", cacheKey],
    { revalidate: 86400 }
  )();
}

export async function getCachedMoodSummary(userId: string, params: MoodSummaryContext) {
  const cacheKey = `${userId}:${getWeekCacheKey()}`;
  return unstable_cache(
    async () => generateMoodSummary(params),
    ["mood-summary", cacheKey],
    { revalidate: 86400 }
  )();
}
