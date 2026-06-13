# MindMate — Mental Wellness Tracker

GenAI-powered wellness companion for students preparing for NEET, JEE, CUET, CAT, GATE, and UPSC.

## Features

- **Daily journal analysis** — AI extracts mood, emotional patterns, stress triggers, coping strategies, motivation, and wellness recommendations
- **Burnout estimation** — Continuous low/medium/high assessment with reasoning
- **Insights dashboard** — Mood timeline, trigger frequency charts, confidence trends
- **Empathetic companion chat** — Context-aware support referencing your journal history
- **Safety guardrails** — No diagnosis; encourages professional help when risk is detected

## Setup

1. **Install dependencies**

```bash
npm install
```

2. **Configure environment**

Copy `.env.example` to `.env.local` and fill in:

```env
DATABASE_URL=postgresql://user:password@your-vps-host:5432/mindmate
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash
```

3. **Apply database schema**

For an **existing** database (recommended — safe, additive only):

```bash
npm run db:migrate:features
```

For a **brand-new** empty database you can use:

```bash
psql $DATABASE_URL -f drizzle/0000_init.sql
psql $DATABASE_URL -f drizzle/0001_auth.sql
npm run db:migrate:features
```

> **Do not run `npm run db:push` on an existing database.** It may try to drop `__drizzle_migrations` and alter primary keys, causing data-loss warnings and errors like `column "id" is in a primary key`.

4. **Run dev server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Testing

```bash
npm test          # Vitest unit + API tests
npm run test:e2e  # Playwright E2E (requires DATABASE_URL + dev server)
```

E2E covers the demo flow: register → onboarding → journal → insights → companion. AI routes are intercepted in tests so no Gemini API key is needed for E2E.

CI runs lint, unit tests, and E2E (with a Postgres service container) on every push and pull request.

## Demo Script (15 seconds per screen)

1. **Onboarding** — Enter name + exam type (e.g. NEET)
2. **Journal** — Submit: *"Studied 10 hours but mock score dropped. Parents asked about rank. Can't sleep."* → Watch AI InsightCard reveal all 6 outputs + burnout gauge
3. **Insights** — Show hidden recurring trigger + mood timeline
4. **Companion** — Ask: *"I'm scared about tomorrow's test"* → Reply references your logged triggers

## Tech Stack

- Next.js 15 (App Router) + TypeScript
- PostgreSQL + Drizzle ORM
- Google Gemini (structured JSON)
- Tailwind CSS + shadcn-style components
- Geist Sans + Space Mono fonts
- Recharts + Framer Motion

## API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/onboarding` | POST | Create user profile |
| `/api/journal` | POST | Analyze journal + persist |
| `/api/insights` | GET | Aggregated trends |
| `/api/companion` | POST/GET | Chat + history |
