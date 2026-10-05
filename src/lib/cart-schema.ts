import { z } from "zod";

export const MAX_ADD_QUANTITY = 20;
export const MAX_LINE_QUANTITY = 99;

export const addToCartFormSchema = z.object({
  productId: z.coerce.number().int().positive(),
  quantity: z.coerce.number().int().min(1).max(MAX_ADD_QUANTITY),
  returnTo: z.string().default("/"),
});

export const setQuantitySchema = z.object({
  productId: z.coerce.number().int().positive(),
  quantity: z.coerce.number().int().min(0).max(MAX_LINE_QUANTITY),
});

export const addItemBodySchema = z.object({
  productId: z.number("Send productId as a number").int().positive(),
  quantity: z
    .number("Send quantity as a number")
    .int()
    .min(1, "Quantity must be at least 1")
    .max(MAX_ADD_QUANTITY, `You can add at most ${MAX_ADD_QUANTITY} at a time`)
    .default(1),
});

export const quantityBodySchema = z.object({
  quantity: z
    .number("Send quantity as a number")
    .int()
    .min(0, "Quantity can't be negative")
    .max(MAX_LINE_QUANTITY, `Quantity can't be more than ${MAX_LINE_QUANTITY}`),
});

export const productIdParamSchema = z.string().regex(/^[1-9]\d{0,8}$/).transform(Number);
