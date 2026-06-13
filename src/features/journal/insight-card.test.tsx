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
  it("renders all six required journal outputs plus burnout", () => {
    render(<InsightCard insight={baseInsight} />);

    expect(screen.getByText(/Mood: Anxious but hopeful/i)).toBeInTheDocument();
    expect(screen.getByText("Emotional Patterns")).toBeInTheDocument();
    expect(screen.getByText(/Overthinking/i)).toBeInTheDocument();
    expect(screen.getByText("Stress Triggers")).toBeInTheDocument();
    expect(screen.getByText(/exam anxiety/i)).toBeInTheDocument();
    expect(screen.getByText("Coping Strategy")).toBeInTheDocument();
    expect(screen.getByText("Take a short walk")).toBeInTheDocument();
    expect(screen.getByText("Motivation")).toBeInTheDocument();
    expect(screen.getByText("You are making progress")).toBeInTheDocument();
    expect(screen.getByText("Wellness Recommendation")).toBeInTheDocument();
    expect(screen.getByText("Sleep earlier tonight")).toBeInTheDocument();
    expect(screen.getByText("Burnout Risk")).toBeInTheDocument();
    expect(screen.getByText(/Long study hours without breaks/i)).toBeInTheDocument();
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
