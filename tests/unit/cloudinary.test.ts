import { describe, expect, it, vi } from "vitest";

vi.stubEnv("NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME", "demo-cloud");
const { cloudinaryUrl, placeholderFor } = await import("@/lib/cloudinary");

const base = "https://res.cloudinary.com/demo-cloud/image/upload";

describe("cloudinaryUrl", () => {
  it("pads product photos into a white square, never cropping them", () => {
    expect(cloudinaryUrl("jblgo2_front", 400, "1:1", undefined, "pad")).toBe(
      `${base}/f_auto,q_auto,c_pad,ar_1:1,b_white,w_400/jblgo2_front`,
    );
  });

  it("crops decorative photos around the subject", () => {
    expect(cloudinaryUrl("pexels-gije-2933606", 1200, "16:9")).toBe(
      `${base}/f_auto,q_auto,c_fill,ar_16:9,g_auto,w_1200/pexels-gije-2933606`,
    );
  });

  it("keeps the photo's own shape for full-screen zoom", () => {
    expect(cloudinaryUrl("jblgo2_front", 1600)).toBe(`${base}/f_auto,q_auto,c_limit,w_1600/jblgo2_front`);
  });

  it("accepts a fixed quality", () => {
    expect(cloudinaryUrl("lid", 100, "1:1", 40, "pad")).toContain("q_40,");
  });
});

describe("placeholderFor", () => {
  it("uses the category drawing, or the accessories one for unknown categories", () => {
    expect(placeholderFor("laptops")).toBe("/placeholders/laptops.svg");
    expect(placeholderFor("drones")).toBe("/placeholders/accessories.svg");
  });
});
