import { describe, expect, it } from "vitest";
import { getAvatarSrc } from "./avatar-src";

describe("getAvatarSrc", () => {
  it("returns null for empty values", () => {
    expect(getAvatarSrc(null)).toBeNull();
    expect(getAvatarSrc(undefined)).toBeNull();
    expect(getAvatarSrc("")).toBeNull();
    expect(getAvatarSrc("   ")).toBeNull();
  });

  it("returns same-origin paths unchanged", () => {
    expect(getAvatarSrc("/images/me.jpg")).toBe("/images/me.jpg");
  });

  it("proxies external https URLs", () => {
    expect(getAvatarSrc("https://example.com/photo.jpg")).toBe(
      "/api/avatar?url=https%3A%2F%2Fexample.com%2Fphoto.jpg"
    );
  });
});
