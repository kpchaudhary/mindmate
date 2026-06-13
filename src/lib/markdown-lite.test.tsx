import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MarkdownLite } from "./markdown-lite";

describe("MarkdownLite", () => {
  it("renders paragraphs safely as text", () => {
    render(<MarkdownLite content="Hello **world**" />);
    expect(screen.getByText("Hello **world**")).toBeInTheDocument();
  });

  it("renders bullet lists", () => {
    render(<MarkdownLite content="- First item\n- Second item" />);
    expect(screen.getByRole("list")).toBeInTheDocument();
    expect(screen.getByText(/First item/)).toBeInTheDocument();
    expect(screen.getByText(/Second item/)).toBeInTheDocument();
  });
});
