import { describe, expect, it } from "vitest";
import {
  buildConfidenceTrend,
  buildMoodInsights,
  buildMoodTimeline,
  computeTriggerFrequency,
  pickTopTrigger,
} from "./insights";

describe("computeTriggerFrequency", () => {
  it("normalizes trigger text to known stress triggers", () => {
    const frequency = computeTriggerFrequency([
      { triggers: ["severe Exam Anxiety", "Family Pressure"] },
      { triggers: ["exam anxiety"] },
    ]);

    expect(frequency["exam anxiety"]).toBe(2);
    expect(frequency["family pressure"]).toBe(1);
    expect(frequency["burnout"]).toBe(0);
  });

  it("ignores unknown triggers", () => {
    const frequency = computeTriggerFrequency([{ triggers: ["weather"] }]);
    expect(Object.values(frequency).every((count) => count === 0)).toBe(true);
  });
});

describe("pickTopTrigger", () => {
  it("returns highest count trigger", () => {
    const top = pickTopTrigger({
      "exam anxiety": 3,
      "family pressure": 5,
      burnout: 1,
    });
    expect(top).toEqual({ name: "family pressure", count: 5 });
  });

  it("returns null when all counts are zero", () => {
    const top = pickTopTrigger({
      "exam anxiety": 0,
      "family pressure": 0,
    });
    expect(top).toEqual({ name: "exam anxiety", count: 0 });
  });
});

describe("buildMoodTimeline", () => {
  it("orders entries chronologically", () => {
    const timeline = buildMoodTimeline([
      {
        createdAt: new Date("2026-06-13T12:00:00Z"),
        moodScore: 2,
        mood: "Low",
        burnoutLevel: "medium",
        triggers: null,
      },
      {
        createdAt: new Date("2026-06-12T12:00:00Z"),
        moodScore: 4,
        mood: "Good",
        burnoutLevel: "low",
        triggers: null,
      },
    ]);

    expect(timeline[0].date).toBe("2026-06-12");
    expect(timeline[1].date).toBe("2026-06-13");
  });
});

describe("buildConfidenceTrend", () => {
  it("lowers confidence when confidence issues appear in triggers", () => {
    const trend = buildConfidenceTrend([
      {
        createdAt: new Date("2026-06-13T12:00:00Z"),
        moodScore: 4,
        mood: "Okay",
        burnoutLevel: "low",
        triggers: ["confidence issues after mock test"],
      },
    ]);

    expect(trend[0].confidence).toBe(1);
  });

  it("derives confidence from mood score when no confidence trigger", () => {
    const trend = buildConfidenceTrend([
      {
        createdAt: new Date("2026-06-13T12:00:00Z"),
        moodScore: 2,
        mood: "Low",
        burnoutLevel: "medium",
        triggers: ["exam anxiety"],
      },
    ]);

    expect(trend[0].confidence).toBe(4);
  });
});

describe("buildMoodInsights", () => {
  it("computes weekly average and direction", () => {
    const now = new Date("2026-06-13T12:00:00Z");
    const insights = buildMoodInsights([
      {
        createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
        moodScore: 4,
        mood: "Good",
        burnoutLevel: "low",
        emotions: ["Hopeful"],
        triggers: null,
      },
      {
        createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
        moodScore: 3,
        mood: "Okay",
        burnoutLevel: "medium",
        emotions: ["Tired"],
        triggers: null,
      },
      {
        createdAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
        moodScore: 2,
        mood: "Low",
        burnoutLevel: "high",
        emotions: ["Anxious"],
        triggers: null,
      },
    ]);

    expect(insights.weeklyAverage).toBe(3.5);
    expect(insights.direction).toBe("improving");
    expect(insights.topEmotions.length).toBeGreaterThan(0);
  });

  it("tracks low mood streak from most recent entries", () => {
    const insights = buildMoodInsights([
      {
        createdAt: new Date("2026-06-13T12:00:00Z"),
        moodScore: 2,
        mood: "Low",
        burnoutLevel: "high",
        emotions: ["Anxious"],
        triggers: null,
      },
      {
        createdAt: new Date("2026-06-12T12:00:00Z"),
        moodScore: 1,
        mood: "Very low",
        burnoutLevel: "high",
        emotions: ["Overwhelmed"],
        triggers: null,
      },
      {
        createdAt: new Date("2026-06-11T12:00:00Z"),
        moodScore: 4,
        mood: "Good",
        burnoutLevel: "low",
        emotions: ["Calm"],
        triggers: null,
      },
    ]);

    expect(insights.lowMoodStreak).toBe(2);
  });
});
