import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";

vi.mock("@/lib/auth/session", () => ({
  destroySession: vi.fn(),
}));

import { destroySession } from "@/lib/auth/session";

describe("POST /api/auth/logout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("destroys session and returns ok", async () => {
    vi.mocked(destroySession).mockResolvedValue(undefined);

    const response = await POST();
    expect(response.status).toBe(200);
    expect(destroySession).toHaveBeenCalledOnce();
    const body = await response.json();
    expect(body.ok).toBe(true);
  });
});
