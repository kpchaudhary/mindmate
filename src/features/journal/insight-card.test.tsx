import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { InsightCard } from "./insight-card";

vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
      <div {...props}>{children}</div>
    ),
  },
  useReducedMotion: () => true,
}));

const baseInsight = {
  mood: "Anxious but hopeful",
  emotionalPatterns: ["Overthinking"],
  stressTriggers: ["exam anxiety"],
  copingStrategy: "Take a short walk",
  motivation: "You are making progress",
  wellnessRecommendation: "Sleep earlier tonight",
  burnoutLevel: "medium" as const,
  burnoutReasoning: "Long study hours without breaks",
  riskFlag: false,
};

describe("InsightCard", () => {
  it("renders mood and burnout insight", () => {
    render(<InsightCard insight={baseInsight} />);
    expect(screen.getByText(/Mood: Anxious but hopeful/i)).toBeInTheDocument();
    expect(screen.getByText("Emotional Patterns")).toBeInTheDocument();
    expect(screen.getByText("Burnout Risk")).toBeInTheDocument();
  });

  it("shows safety banner when riskFlag is true", () => {
    render(<InsightCard insight={{ ...baseInsight, riskFlag: true }} />);
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText(/going through a tough time/i)).toBeInTheDocument();
  });

  it("hides safety banner when riskFlag is false", () => {
    render(<InsightCard insight={baseInsight} />);
    expect(screen.queryByText(/going through a tough time/i)).not.toBeInTheDocument();
  });
});
