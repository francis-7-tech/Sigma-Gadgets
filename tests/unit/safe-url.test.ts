import { describe, expect, it } from "vitest";
import { safeCallbackUrl } from "@/lib/safe-url";

describe("safeCallbackUrl", () => {
  it("keeps paths on this site, including query strings", () => {
    expect(safeCallbackUrl("/cart")).toBe("/cart");
    expect(safeCallbackUrl("/products/jbl-go-2")).toBe("/products/jbl-go-2");
    expect(safeCallbackUrl("/products?category=audio&sort=newest")).toBe("/products?category=audio&sort=newest");
  });

  it("falls back to the home page when there is nothing usable", () => {
    expect(safeCallbackUrl(undefined)).toBe("/");
    expect(safeCallbackUrl("")).toBe("/");
    expect(safeCallbackUrl(["/cart", "/orders"])).toBe("/");
    expect(safeCallbackUrl("cart")).toBe("/");
  });

  it("blocks links to other websites", () => {
    for (const evil of [
      "https://evil.com",
      "//evil.com",
      "//evil.com/cart",
      "/\\evil.com",
      "/\t/evil.com",
      "/\n/evil.com",
      "javascript:alert(1)",
    ]) {
      expect(safeCallbackUrl(evil), JSON.stringify(evil)).toBe("/");
    }
  });
});
