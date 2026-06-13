import { afterEach, describe, expect, it, vi } from "vitest";
import { getTimeGreeting } from "./greeting";

describe("getTimeGreeting", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns Good morning before noon", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-13T09:00:00"));
    expect(getTimeGreeting()).toBe("Good morning");
  });

  it("returns Good afternoon before 5pm", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-13T14:00:00"));
    expect(getTimeGreeting()).toBe("Good afternoon");
  });

  it("returns Good evening after 5pm", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-13T20:00:00"));
    expect(getTimeGreeting()).toBe("Good evening");
  });
});
