import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "./route";

describe("GET /api/avatar", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("returns 400 when url is missing", async () => {
    const response = await GET(new Request("http://localhost/api/avatar"));
    expect(response.status).toBe(400);
  });

  it("returns 400 for non-https URLs", async () => {
    const response = await GET(
      new Request("http://localhost/api/avatar?url=http://example.com/a.jpg")
    );
    expect(response.status).toBe(400);
  });

  it("proxies a valid image response", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(new Uint8Array([1, 2, 3]), {
        status: 200,
        headers: { "Content-Type": "image/jpeg" },
      })
    );

    const response = await GET(
      new Request("http://localhost/api/avatar?url=https://example.com/a.jpg")
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("image/jpeg");
    expect(global.fetch).toHaveBeenCalledWith("https://example.com/a.jpg", {
      headers: { Accept: "image/*" },
      next: { revalidate: 3600 },
    });
  });
});
