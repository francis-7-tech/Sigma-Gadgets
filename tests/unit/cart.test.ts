import { beforeEach, describe, expect, it, vi } from "vitest";
import { cartItems, products } from "@/db/schema";

const fake = vi.hoisted(() => ({
  stock: null as number | null,
  inCart: null as number | null,
  notify: vi.fn(),
}));

vi.mock("@/lib/realtime", () => ({ notifyCartChanged: fake.notify }));
vi.mock("@/db/client", () => ({
  db: {
    select: () => ({
      from: (table: unknown) => ({
        where: async () => {
          if (table === products) return fake.stock === null ? [] : [{ stock: fake.stock }];
          if (table === cartItems) return fake.inCart === null ? [] : [{ quantity: fake.inCart }];
          return [];
        },
      }),
    }),
    insert: () => ({
      values: (row: { quantity: number }) => ({
        onConflictDoUpdate: async () => {
          fake.inCart = row.quantity;
        },
      }),
    }),
    update: () => ({
      set: (row: { quantity: number }) => ({
        where: () => ({
          returning: async () => {
            if (fake.inCart === null) return [];
            fake.inCart = row.quantity;
            return [{ productId: 1 }];
          },
        }),
      }),
    }),
    delete: () => ({
      where: () => ({
        returning: async () => {
          if (fake.inCart === null) return [];
          fake.inCart = null;
          return [{ productId: 1 }];
        },
      }),
    }),
  },
}));

const { addItemToCart, describeAddToCart, setCartItemQuantity } = await import("@/lib/cart");

beforeEach(() => {
  fake.stock = 5;
  fake.inCart = null;
  fake.notify.mockReset();
});

describe("addItemToCart", () => {
  it("adds a new item and signals the change", async () => {
    const result = await addItemToCart("user-1", 1, 2);

    expect(result).toEqual({ ok: true, quantity: 2, stock: 5, limited: false });
    expect(fake.inCart).toBe(2);
    expect(fake.notify).toHaveBeenCalledExactlyOnceWith("user-1");
  });

  it("adds on top of what is already in the cart", async () => {
    fake.inCart = 2;

    expect(await addItemToCart("user-1", 1, 2)).toMatchObject({ ok: true, quantity: 4, limited: false });
  });

  it("caps the quantity at the stock level", async () => {
    fake.inCart = 4;

    const result = await addItemToCart("user-1", 1, 3);

    expect(result).toEqual({ ok: true, quantity: 5, stock: 5, limited: true });
    expect(describeAddToCart(result)).toBe("Added (only 5 available)");
  });

  it("refuses when the cart already holds all the stock", async () => {
    fake.inCart = 5;

    const result = await addItemToCart("user-1", 1, 1);

    expect(result).toEqual({ ok: false, reason: "limit-reached", stock: 5 });
    expect(describeAddToCart(result)).toBe("You already have all 5 available in your cart.");
    expect(fake.inCart).toBe(5);
    expect(fake.notify).not.toHaveBeenCalled();
  });

  it("refuses sold-out and unknown products without signalling", async () => {
    fake.stock = 0;
    const soldOut = await addItemToCart("user-1", 1, 1);
    fake.stock = null;
    const unknown = await addItemToCart("user-1", 1, 1);

    expect(describeAddToCart(soldOut)).toBe("Sorry, this item is out of stock.");
    expect(describeAddToCart(unknown)).toBe("This product is no longer available.");
    expect(fake.inCart).toBeNull();
    expect(fake.notify).not.toHaveBeenCalled();
  });
});

describe("setCartItemQuantity", () => {
  it("changes the quantity and signals the change", async () => {
    fake.inCart = 1;

    expect(await setCartItemQuantity("user-1", 1, 3)).toEqual({ ok: true, quantity: 3 });
    expect(fake.inCart).toBe(3);
    expect(fake.notify).toHaveBeenCalledExactlyOnceWith("user-1");
  });

  it("caps the quantity at the stock level", async () => {
    fake.inCart = 1;

    expect(await setCartItemQuantity("user-1", 1, 50)).toEqual({ ok: true, quantity: 5 });
  });

  it("removes the item when the quantity is 0", async () => {
    fake.inCart = 3;

    expect(await setCartItemQuantity("user-1", 1, 0)).toEqual({ ok: true, quantity: 0 });
    expect(fake.inCart).toBeNull();
    expect(fake.notify).toHaveBeenCalledOnce();
  });

  it("treats removing a missing item as done, without signalling", async () => {
    expect(await setCartItemQuantity("user-1", 1, 0)).toEqual({ ok: true, quantity: 0 });
    expect(fake.notify).not.toHaveBeenCalled();
  });

  it("reports an item that isn't in the cart", async () => {
    expect(await setCartItemQuantity("user-1", 1, 2)).toEqual({ ok: false, reason: "not-in-cart" });
    expect(fake.notify).not.toHaveBeenCalled();
  });
});
