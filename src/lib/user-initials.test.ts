import { describe, expect, it } from "vitest";
import { getUserInitials } from "./user-initials";

describe("getUserInitials", () => {
  it("returns initials for full name", () => {
    expect(getUserInitials("Priya Sharma")).toBe("PS");
  });

  it("returns single initial for one name", () => {
    expect(getUserInitials("Priya")).toBe("P");
  });

  it("handles extra whitespace", () => {
    expect(getUserInitials("  Priya   Sharma  ")).toBe("PS");
  });
});
