import type { Cart } from "@/lib/cart";
import type { ProductSummary } from "@/lib/catalog";
import { cloudinaryUrl, cloudName } from "@/lib/cloudinary";
import type { ProductSpec } from "@/db/schema";

const THUMBNAIL_WIDTH = 600;
const FULL_WIDTH = 1200;

function productImageUrl(publicId: string | undefined, width: number): string | null {
  return publicId && cloudName ? cloudinaryUrl(publicId, width, "1:1", undefined, "pad") : null;
}

export function toApiProduct(product: ProductSummary) {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    priceKobo: product.priceKobo,
    stock: product.stock,
    illustrativePhoto: product.illustrativePhoto,
    category: { name: product.categoryName, slug: product.categorySlug },
    imageUrl: productImageUrl(product.images[0], THUMBNAIL_WIDTH),
  };
}

export function toApiProductDetail(product: ProductSummary & { description: string; specs: ProductSpec[] }) {
  return {
    ...toApiProduct(product),
    description: product.description,
    specs: product.specs,
    imageUrls: product.images.flatMap((publicId) => productImageUrl(publicId, FULL_WIDTH) ?? []),
  };
}

export function toApiCart(cart: Cart) {
  return {
    itemCount: cart.itemCount,
    subtotalKobo: cart.subtotalKobo,
    deliveryFeeKobo: cart.deliveryFeeKobo,
    totalKobo: cart.totalKobo,
    hasStockProblem: cart.hasStockProblem,
    lines: cart.lines.map((line) => ({
      productId: line.productId,
      name: line.name,
      slug: line.slug,
      priceKobo: line.priceKobo,
      stock: line.stock,
      quantity: line.quantity,
      lineTotalKobo: line.lineTotalKobo,
      exceedsStock: line.exceedsStock,
      category: { name: line.categoryName, slug: line.categorySlug },
      imageUrl: productImageUrl(line.images[0], THUMBNAIL_WIDTH),
    })),
  };
}

export type ApiProduct = ReturnType<typeof toApiProduct>;
export type ApiProductDetail = ReturnType<typeof toApiProductDetail>;
export type ApiCart = ReturnType<typeof toApiCart>;
