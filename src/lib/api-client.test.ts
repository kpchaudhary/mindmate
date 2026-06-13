import { describe, expect, it, vi } from "vitest";
import { apiFetch } from "./api-client";

describe("apiFetch", () => {
  it("returns parsed JSON on success", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ ok: true }),
      })
    );

    const result = await apiFetch<{ ok: boolean }>("/api/test");
    expect(result.ok).toBe(true);
    vi.unstubAllGlobals();
  });

  it("throws ApiError with server message on failure", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({ error: "Invalid input" }),
      })
    );

    await expect(apiFetch("/api/test")).rejects.toMatchObject({
      message: "Invalid input",
      status: 400,
    });
    vi.unstubAllGlobals();
  });
});
