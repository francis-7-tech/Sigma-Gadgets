import { z } from "zod";

export const PRODUCT_SORTS = ["newest", "price-asc", "price-desc"] as const;

export const productQuerySchema = z.object({
  category: z.string().trim().max(60).optional(),
  q: z.string().trim().max(100).optional(),
  sort: z.enum(PRODUCT_SORTS, { message: `sort must be one of: ${PRODUCT_SORTS.join(", ")}` }).default("newest"),
});
