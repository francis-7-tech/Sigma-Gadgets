import { describe, expect, it, vi } from "vitest";
import type { Cart } from "@/lib/cart";
import type { ProductSummary } from "@/lib/catalog";

vi.stubEnv("NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME", "demo-cloud");
const { toApiCart, toApiProduct, toApiProductDetail } = await import("@/lib/api-serializers");

const speaker: ProductSummary = {
  id: 12,
  name: "JBL GO 2 Portable Speaker",
  slug: "jbl-go-2",
  priceKobo: 2_800_000,
  stock: 12,
  images: ["jblgo2_front", "jblgo2_back"],
  illustrativePhoto: false,
  categoryName: "Audio",
  categorySlug: "audio",
};

const padded = (id: string, width: number) =>
  `https://res.cloudinary.com/demo-cloud/image/upload/f_auto,q_auto,c_pad,ar_1:1,b_white,w_${width}/${id}`;

describe("toApiProduct", () => {
  it("returns a ready-to-use square image URL and a nested category", () => {
    expect(toApiProduct(speaker)).toEqual({
      id: 12,
      name: "JBL GO 2 Portable Speaker",
      slug: "jbl-go-2",
      priceKobo: 2_800_000,
      stock: 12,
      illustrativePhoto: false,
      category: { name: "Audio", slug: "audio" },
      imageUrl: padded("jblgo2_front", 600),
    });
  });

  it("returns null when the product has no photo", () => {
    expect(toApiProduct({ ...speaker, images: [] }).imageUrl).toBeNull();
  });
});

describe("toApiProductDetail", () => {
  it("adds the description, specs and every photo at full size", () => {
    const detail = toApiProductDetail({ ...speaker, description: "Pocket speaker.", specs: [{ label: "Battery", value: "5 hours" }] });

    expect(detail.description).toBe("Pocket speaker.");
    expect(detail.specs).toEqual([{ label: "Battery", value: "5 hours" }]);
    expect(detail.imageUrls).toEqual([padded("jblgo2_front", 1200), padded("jblgo2_back", 1200)]);
  });
});

describe("toApiCart", () => {
  it("keeps the totals and maps each line", () => {
    const cart: Cart = {
      itemCount: 2,
      subtotalKobo: 5_600_000,
      deliveryFeeKobo: 500_000,
      totalKobo: 6_100_000,
      hasStockProblem: false,
      lines: [
        {
          productId: 12,
          name: speaker.name,
          slug: speaker.slug,
          priceKobo: speaker.priceKobo,
          stock: 12,
          images: speaker.images,
          categoryName: "Audio",
          categorySlug: "audio",
          quantity: 2,
          lineTotalKobo: 5_600_000,
          exceedsStock: false,
        },
      ],
    };

    expect(toApiCart(cart)).toEqual({
      itemCount: 2,
      subtotalKobo: 5_600_000,
      deliveryFeeKobo: 500_000,
      totalKobo: 6_100_000,
      hasStockProblem: false,
      lines: [
        {
          productId: 12,
          name: speaker.name,
          slug: speaker.slug,
          priceKobo: 2_800_000,
          stock: 12,
          quantity: 2,
          lineTotalKobo: 5_600_000,
          exceedsStock: false,
          category: { name: "Audio", slug: "audio" },
          imageUrl: padded("jblgo2_front", 600),
        },
      ],
    });
  });
});
