import { describe, expect, it } from "vitest";
import { addItemBodySchema, addToCartFormSchema, productIdParamSchema, quantityBodySchema, setQuantitySchema } from "@/lib/cart-schema";

describe("addItemBodySchema (API)", () => {
  it("accepts a product and quantity", () => {
    expect(addItemBodySchema.parse({ productId: 7, quantity: 2 })).toEqual({ productId: 7, quantity: 2 });
  });

  it("defaults the quantity to 1", () => {
    expect(addItemBodySchema.parse({ productId: 7 }).quantity).toBe(1);
  });

  it("rejects text, fractions, zero and more than 20 at a time", () => {
    for (const body of [{ productId: "7" }, { productId: 7, quantity: "2" }, { productId: 7, quantity: 1.5 }, { productId: 7, quantity: 0 }, { productId: 7, quantity: 21 }, { productId: -1 }, {}, undefined, null, "7"]) {
      expect(addItemBodySchema.safeParse(body).success, JSON.stringify(body)).toBe(false);
    }
  });
});

describe("quantityBodySchema (API)", () => {
  it("accepts 0 (remove) up to 99", () => {
    expect(quantityBodySchema.safeParse({ quantity: 0 }).success).toBe(true);
    expect(quantityBodySchema.safeParse({ quantity: 99 }).success).toBe(true);
  });

  it("rejects negative, too large, fractional or missing quantities", () => {
    for (const body of [{ quantity: -1 }, { quantity: 100 }, { quantity: 2.5 }, { quantity: "3" }, {}, undefined]) {
      expect(quantityBodySchema.safeParse(body).success, JSON.stringify(body)).toBe(false);
    }
  });
});

describe("productIdParamSchema (URL)", () => {
  it("turns a numeric path segment into a number", () => {
    expect(productIdParamSchema.parse("42")).toBe(42);
  });

  it("rejects anything that isn't a positive whole number", () => {
    for (const value of ["0", "-3", "1.5", "abc", "", "1e3", " 7", "07", "9999999999"]) {
      expect(productIdParamSchema.safeParse(value).success, JSON.stringify(value)).toBe(false);
    }
  });
});

describe("website form schemas", () => {
  it("read numbers from form text", () => {
    expect(addToCartFormSchema.parse({ productId: "7", quantity: "2", returnTo: "/products" })).toEqual({ productId: 7, quantity: 2, returnTo: "/products" });
    expect(setQuantitySchema.parse({ productId: "7", quantity: "0" })).toEqual({ productId: 7, quantity: 0 });
  });

  it("keep the same limits as the API", () => {
    expect(addToCartFormSchema.safeParse({ productId: "7", quantity: "21" }).success).toBe(false);
    expect(setQuantitySchema.safeParse({ productId: "7", quantity: "100" }).success).toBe(false);
  });
});
