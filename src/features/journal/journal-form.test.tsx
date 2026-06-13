import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { JournalForm } from "./journal-form";

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

const mockUser = {
  id: "user-1",
  email: "student@example.com",
  name: "Priya",
  examType: "NEET",
};

describe("JournalForm", () => {
  it("disables submit when journal content is too short", () => {
    render(<JournalForm user={mockUser} />);
    const button = screen.getByRole("button", { name: /analyze my journal/i });
    expect(button).toBeDisabled();
  });

  it("enables submit when journal content meets minimum length", async () => {
    const user = userEvent.setup();
    render(<JournalForm user={mockUser} />);

    const textarea = screen.getByLabelText(/what's on your mind/i);
    await user.type(textarea, "Studied for hours but still feel behind.");

    const button = screen.getByRole("button", { name: /analyze my journal/i });
    expect(button).not.toBeDisabled();
  });
});
