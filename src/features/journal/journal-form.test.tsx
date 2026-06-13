import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { TooltipProvider } from "@/components/ui/tooltip";
import { JournalForm } from "./journal-form";

function renderForm() {
  return render(
    <TooltipProvider>
      <JournalForm user={mockUser} />
    </TooltipProvider>
  );
}

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

vi.mock("@/hooks/use-voice-journal", () => ({
  useVoiceJournal: () => ({
    isSupported: false,
    isListening: false,
    interimTranscript: "",
    error: null,
    start: vi.fn(),
    stop: vi.fn(),
    toggle: vi.fn(),
  }),
}));

const mockUser = {
  id: "user-1",
  email: "student@example.com",
  name: "Priya",
  examType: "NEET",
  examDate: null,
  streakCount: 0,
  reminderEnabled: false,
  reminderTime: null,
  language: "en" as const,
};

describe("JournalForm", () => {
  it("disables submit when journal content is too short", () => {
    renderForm();
    const button = screen.getByRole("button", { name: /analyze my journal/i });
    expect(button).toBeDisabled();
  });

  it("enables submit when journal content meets minimum length", async () => {
    const user = userEvent.setup();
    renderForm();

    const textarea = screen.getByLabelText(/what's on your mind/i);
    await user.type(textarea, "Studied for hours but still feel behind.");

    const button = screen.getByRole("button", { name: /analyze my journal/i });
    expect(button).not.toBeDisabled();
  });
});
