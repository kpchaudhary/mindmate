import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const journalFixture = {
  entryId: "e2e-entry-1",
  streakCount: 1,
  analysis: {
    mood: "Anxious but determined",
    emotionalPatterns: ["Overthinking", "Self-doubt"],
    stressTriggers: ["exam anxiety", "family pressure"],
    copingStrategy: "Take a 10-minute break between study blocks.",
    motivation: "You showed up today — that counts.",
    wellnessRecommendation: "Try a wind-down routine tonight.",
    burnoutLevel: "medium",
    burnoutReasoning: "Long study hours without adequate breaks.",
    riskFlag: false,
  },
};

const insightsFixture = {
  triggerFrequency: {
    "exam anxiety": 2,
    "family pressure": 1,
    burnout: 0,
    "sleep issues": 0,
    "social comparison": 0,
    "confidence issues": 0,
  },
  moodTimeline: [
    {
      date: "2026-06-13",
      moodScore: 2,
      mood: "Anxious but determined",
      burnoutLevel: "medium",
    },
  ],
  burnoutTrend: [
    {
      date: "2026-06-13",
      burnoutScore: 2,
      burnoutLevel: "medium",
    },
  ],
  mockScoreCorrelation: [],
  topTrigger: { name: "exam anxiety", count: 2 },
  recentBurnout: "medium",
  confidenceTrend: [{ date: "2026-06-13", confidence: 4 }],
  totalEntries: 1,
  entries: [{ burnoutReasoning: "Long study hours without adequate breaks." }],
  weeklySummary: null,
  moodInsights: {
    weeklyAverage: 2,
    priorWeeklyAverage: null,
    delta: null,
    direction: "stable",
    byDayOfWeek: [
      { day: "Mon", average: 3 },
      { day: "Tue", average: 2 },
      { day: "Wed", average: null },
      { day: "Thu", average: null },
      { day: "Fri", average: null },
      { day: "Sat", average: null },
      { day: "Sun", average: 2 },
    ],
    topEmotions: [{ emotion: "Anxious", count: 2 }],
    moodBurnoutCorrelation: { lowBurnoutAvg: null, highBurnoutAvg: 2 },
    lowMoodStreak: 0,
  },
  moodSummary: {
    patternInsight: "Your mood tends to dip on Sundays after long study weeks.",
    correlationNote: "Lower mood scores appear on medium burnout days.",
    gentleAction: "Schedule a lighter revision block tomorrow morning.",
  },
  daysToExam: null,
  streakCount: 1,
  examDate: null,
  promptChips: ["How do I manage exam anxiety?"],
};

test("demo flow: register → onboarding → journal → insights → companion", async ({ page }) => {
  const email = `e2e+${Date.now()}@example.com`;
  const password = "password123";

  await page.goto("/register");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByLabel("Confirm password").fill(password);
  await page.getByRole("button", { name: "Create account" }).click();

  await expect(page).toHaveURL(/\/onboarding/);
  await page.getByLabel("Your name").fill("Priya");
  await page.getByRole("button", { name: "Continue" }).click();
  await page.locator("#exam").click();
  await page.getByRole("option", { name: "NEET" }).click();
  await page.getByRole("button", { name: "Start my wellness journey" }).click();

  await expect(page).toHaveURL(/\/insights/);

  await page.route("**/api/journal", async (route) => {
    if (route.request().method() === "POST") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(journalFixture),
      });
      return;
    }
    await route.continue();
  });

  await page.goto("/journal");
  await page.getByLabel(/what's on your mind/i).fill(
    "Studied 10 hours but mock score dropped. Parents asked about rank. Can't sleep."
  );
  await page.getByRole("button", { name: /analyze my journal/i }).click();

  await expect(page.getByText(/Mood: Anxious but determined/i)).toBeVisible();
  await expect(page.getByText("Burnout Risk")).toBeVisible();

  await page.route("**/api/insights", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(insightsFixture),
    });
  });

  await page.goto("/insights");
  await expect(page.getByText("Mood Timeline")).toBeVisible();
  await expect(page.getByText("Mood Insights")).toBeVisible();
  await expect(page.getByText("Stress Trigger Frequency")).toBeVisible();

  await page.route("**/api/study-plan", async (route) => {
    if (route.request().method() === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          plan: {
            id: "plan-e2e-1",
            title: "NEET Recovery Week",
            weekStart: "2026-06-09T00:00:00.000Z",
            aiRationale: "Lighter plan because burnout is medium.",
          },
          items: [
            {
              id: "item-e2e-1",
              subject: "Biology",
              topic: "Cell structure",
              description: "Revise NCERT chapter 8",
              durationMinutes: 60,
              scheduledDate: "2026-06-09T09:00:00.000Z",
              status: "pending",
              sortOrder: 0,
              isUserEdited: false,
            },
          ],
          progress: { total: 1, done: 0, percent: 0 },
        }),
      });
      return;
    }
    await route.continue();
  });

  await page.goto("/study-plan");
  await expect(page.getByText("NEET Recovery Week")).toBeVisible();
  await expect(page.getByText(/Cell structure/i)).toBeVisible();

  await page.route("**/api/companion", async (route) => {
    if (route.request().method() === "POST") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: "msg-e2e-1",
          message:
            "I hear you, Priya. Exam anxiety has come up in your journals — let's take this one step at a time.",
        }),
      });
      return;
    }
    await route.continue();
  });

  await page.goto("/companion");
  await page.getByLabel("Message to MindMate").fill("I'm scared about tomorrow's test");
  await page.getByLabel("Send message").click();

  await expect(
    page.getByText(/Exam anxiety has come up in your journals/i)
  ).toBeVisible();

  for (const path of ["/login", "/journal", "/insights", "/companion"]) {
    await page.goto(path === "/login" ? "/login" : path);
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  }
});
