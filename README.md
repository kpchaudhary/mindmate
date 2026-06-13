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

3. **Push database schema**

```bash
npm run db:push
```

Or run the SQL migration manually on your VPS Postgres:

```bash
psql $DATABASE_URL -f drizzle/0000_init.sql
```

4. **Run dev server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

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
