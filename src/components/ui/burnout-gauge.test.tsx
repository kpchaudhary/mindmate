import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BurnoutGauge } from "./burnout-gauge";

describe("BurnoutGauge", () => {
  it("renders level and reasoning with meter semantics", () => {
    render(<BurnoutGauge level="medium" reasoning="Long study hours without breaks" />);
    expect(screen.getByRole("meter", { name: /burnout risk: medium/i })).toBeInTheDocument();
    expect(screen.getByText(/Long study hours without breaks/i)).toBeInTheDocument();
  });
});
