import { createHash, randomBytes } from "node:crypto";
import { expect, test, type APIRequestContext } from "@playwright/test";
import { formatNaira } from "@/lib/money";
import { deliveryFeeKobo } from "@/lib/site";
import {
  closeDb,
  createSession,
  createTestCustomer,
  getProduct,
  removeTestCustomers,
  signIn,
  type TestCustomer,
} from "./test-customer";

const PRODUCT = "jbl-go-2";
const SECOND_PRODUCT = "anker-powercore-10000";
const SOLD_OUT_PRODUCT = "jbl-flip-4";

let customer: TestCustomer;

function bearer(token: string) {
  return { Authorization: `Bearer ${token}` };
}

async function emptyCart(request: APIRequestContext) {
  const { cart } = await (await request.get("/api/v1/cart", { headers: bearer(customer.sessionToken) })).json();
  for (const line of cart.lines) {
    await request.delete(`/api/v1/cart/items/${line.productId}`, { headers: bearer(customer.sessionToken) });
  }
}

test.beforeAll(async () => {
  await removeTestCustomers();
  customer = await createTestCustomer();
});

test.afterAll(async () => {
  await removeTestCustomers();
  await closeDb();
});

test.describe("catalogue (public)", () => {
  test("lists products with ready-to-use image URLs", async ({ request }) => {
    const response = await request.get("/api/v1/products");

    expect(response.status()).toBe(200);
    expect(response.headers()["cache-control"]).toBe("no-store");
    const { products } = await response.json();
    expect(products.length).toBeGreaterThan(10);
    for (const product of products) {
      expect(product.imageUrl, product.slug).toMatch(/^https:\/\/res\.cloudinary\.com\/.+c_pad,ar_1:1/);
      expect(Number.isInteger(product.priceKobo), product.slug).toBe(true);
    }
  });

  test("filters by category, searches by name and sorts by price", async ({ request }) => {
    const audio = (await (await request.get("/api/v1/products?category=audio")).json()).products;
    expect(audio.length).toBeGreaterThan(0);
    expect(audio.every((p: { category: { slug: string } }) => p.category.slug === "audio")).toBe(true);

    const jbl = (await (await request.get("/api/v1/products?q=jbl")).json()).products;
    expect(jbl.length).toBeGreaterThan(0);
    expect(jbl.every((p: { name: string }) => /jbl/i.test(p.name))).toBe(true);

    const cheapestFirst = (await (await request.get("/api/v1/products?sort=price-asc")).json()).products;
    const prices = cheapestFirst.map((p: { priceKobo: number }) => p.priceKobo);
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
  });

  test("rejects an unknown sort order", async ({ request }) => {
    const response = await request.get("/api/v1/products?sort=random");

    expect(response.status()).toBe(400);
    const { error } = await response.json();
    expect(error.code).toBe("invalid_request");
    expect(error.fields.sort).toContain("newest");
  });

  test("returns one product with its description, specs and photos", async ({ request }) => {
    const expected = await getProduct(PRODUCT);
    const { product } = await (await request.get(`/api/v1/products/${PRODUCT}`)).json();

    expect(product).toMatchObject({ id: expected.id, name: expected.name, priceKobo: expected.priceKobo, description: expected.description });
    expect(product.specs.length).toBeGreaterThan(0);
    expect(product.imageUrls).toHaveLength(expected.images.length);
  });

  test("answers 404 for a product that doesn't exist", async ({ request }) => {
    const response = await request.get("/api/v1/products/no-such-gadget");

    expect(response.status()).toBe(404);
    expect((await response.json()).error.code).toBe("product_not_found");
  });

  test("lists the categories with product counts", async ({ request }) => {
    const { categories } = await (await request.get("/api/v1/categories")).json();

    expect(categories.map((c: { slug: string }) => c.slug)).toEqual(["phones", "laptops", "audio", "wearables", "accessories"]);
    expect(categories.every((c: { count: number }) => c.count > 0)).toBe(true);
  });
});

test.describe("signing in", () => {
  test("cart and account endpoints need a login token", async ({ request }) => {
    const attempts = [
      await request.get("/api/v1/me"),
      await request.get("/api/v1/cart"),
      await request.post("/api/v1/cart/items", { data: { productId: 1, quantity: 1 } }),
      await request.patch("/api/v1/cart/items/1", { data: { quantity: 2 } }),
      await request.delete("/api/v1/cart/items/1"),
    ];

    for (const response of attempts) {
      expect(response.status(), response.url()).toBe(401);
      expect((await response.json()).error.code).toBe("unauthorized");
    }
  });

  test("rejects made-up, malformed and expired tokens", async ({ request }) => {
    const expired = await createSession(customer.id, new Date(Date.now() - 60_000));

    for (const headers of [bearer("00000000-0000-4000-8000-000000000000"), bearer(expired), { Authorization: "Bearer" }, { Authorization: `Basic ${customer.sessionToken}` }]) {
      expect((await request.get("/api/v1/cart", { headers })).status(), JSON.stringify(headers)).toBe(401);
    }
  });

  test("returns the signed-in user", async ({ request }) => {
    const response = await request.get("/api/v1/me", { headers: bearer(customer.sessionToken) });

    expect(response.status()).toBe(200);
    expect((await response.json()).user).toEqual({ id: customer.id, name: customer.name, email: customer.email, image: null });
  });
});

test("the cart can be filled, changed and emptied through the API", async ({ request }) => {
  const product = await getProduct(PRODUCT);
  expect(product.stock, `${PRODUCT} needs at least 3 in stock for this test`).toBeGreaterThanOrEqual(3);
  const headers = bearer(customer.sessionToken);
  await emptyCart(request);

  await test.step("a new customer's cart is empty", async () => {
    const { cart } = await (await request.get("/api/v1/cart", { headers })).json();
    expect(cart).toEqual({ itemCount: 0, subtotalKobo: 0, deliveryFeeKobo: 0, totalKobo: 0, hasStockProblem: false, lines: [] });
  });

  await test.step("adding returns the updated cart with totals", async () => {
    const response = await request.post("/api/v1/cart/items", { headers, data: { productId: product.id, quantity: 2 } });

    expect(response.status()).toBe(200);
    const { cart, message } = await response.json();
    expect(message).toBe("Added to cart");
    expect(cart.itemCount).toBe(2);
    expect(cart.subtotalKobo).toBe(product.priceKobo * 2);
    expect(cart.totalKobo).toBe(product.priceKobo * 2 + deliveryFeeKobo);
    expect(cart.lines).toHaveLength(1);
    expect(cart.lines[0]).toMatchObject({ productId: product.id, name: product.name, quantity: 2, lineTotalKobo: product.priceKobo * 2 });
  });

  await test.step("adding more than the stock is capped at the stock", async () => {
    await request.patch(`/api/v1/cart/items/${product.id}`, { headers, data: { quantity: product.stock - 1 } });
    const { cart, message } = await (await request.post("/api/v1/cart/items", { headers, data: { productId: product.id, quantity: 5 } })).json();

    expect(cart.lines[0].quantity).toBe(product.stock);
    expect(message).toBe(`Added (only ${product.stock} available)`);

    const full = await request.post("/api/v1/cart/items", { headers, data: { productId: product.id, quantity: 1 } });
    expect(full.status()).toBe(409);
    expect((await full.json()).error.code).toBe("limit_reached");
  });

  await test.step("the quantity can be changed", async () => {
    const response = await request.patch(`/api/v1/cart/items/${product.id}`, { headers, data: { quantity: 3 } });

    expect(response.status()).toBe(200);
    expect((await response.json()).cart.lines[0].quantity).toBe(3);
  });

  await test.step("bad input is refused with field messages", async () => {
    const badQuantity = await request.patch(`/api/v1/cart/items/${product.id}`, { headers, data: { quantity: "3" } });
    expect(badQuantity.status()).toBe(400);
    expect((await badQuantity.json()).error.fields.quantity).toBeTruthy();

    const badAdd = await request.post("/api/v1/cart/items", { headers, data: { productId: "abc", quantity: 0 } });
    expect(badAdd.status()).toBe(400);
    expect(Object.keys((await badAdd.json()).error.fields).sort()).toEqual(["productId", "quantity"]);

    const notJson = await request.post("/api/v1/cart/items", { headers: { ...headers, "content-type": "application/json" }, data: "{not json" });
    expect(notJson.status()).toBe(400);
  });

  await test.step("unknown and sold-out products are refused", async () => {
    const unknown = await request.post("/api/v1/cart/items", { headers, data: { productId: 987_654_321, quantity: 1 } });
    expect(unknown.status()).toBe(404);
    expect((await unknown.json()).error.code).toBe("product_not_found");

    const soldOut = await getProduct(SOLD_OUT_PRODUCT);
    if (soldOut.stock === 0) {
      const response = await request.post("/api/v1/cart/items", { headers, data: { productId: soldOut.id, quantity: 1 } });
      expect(response.status()).toBe(409);
      expect((await response.json()).error.code).toBe("out_of_stock");
    }
  });

  await test.step("an item can be removed, and removing twice is harmless", async () => {
    const removed = await request.delete(`/api/v1/cart/items/${product.id}`, { headers });
    expect(removed.status()).toBe(200);
    expect((await removed.json()).cart.lines).toEqual([]);

    expect((await request.delete(`/api/v1/cart/items/${product.id}`, { headers })).status()).toBe(200);

    const missing = await request.patch(`/api/v1/cart/items/${product.id}`, { headers, data: { quantity: 2 } });
    expect(missing.status()).toBe(404);
    expect((await missing.json()).error.code).toBe("not_in_cart");
  });
});

test("the website and the API share one cart for the same account", async ({ page, context, request, baseURL }) => {
  const product = await getProduct(PRODUCT);
  const second = await getProduct(SECOND_PRODUCT);
  expect(second.stock, `${SECOND_PRODUCT} needs stock for this test`).toBeGreaterThan(0);
  const headers = bearer(customer.sessionToken);
  await emptyCart(request);
  await signIn(context, customer, baseURL!);

  await test.step("an item added on the website shows up through the API", async () => {
    await page.goto(`/products/${PRODUCT}`);
    await page.getByRole("button", { name: "Add to cart" }).click();
    await expect(page.getByText("Added to cart")).toBeVisible();

    const { cart } = await (await request.get("/api/v1/cart", { headers })).json();
    expect(cart.lines).toHaveLength(1);
    expect(cart.lines[0]).toMatchObject({ productId: product.id, quantity: 1 });
  });

  await test.step("an item added through the API shows up on the website", async () => {
    await request.post("/api/v1/cart/items", { headers, data: { productId: second.id, quantity: 2 } });

    await page.goto("/cart");
    await expect(page.getByRole("group", { name: `Quantity of ${product.name}` })).toBeVisible();
    await expect(page.getByRole("group", { name: `Quantity of ${second.name}` })).toBeVisible();
    const total = product.priceKobo + second.priceKobo * 2 + deliveryFeeKobo;
    await expect(page.getByRole("complementary", { name: "Order summary" })).toContainText(formatNaira(total));
  });

  await test.step("the website's own sign-in cookie works on the same endpoints", async () => {
    const response = await page.request.get("/api/v1/cart");

    expect(response.status()).toBe(200);
    expect((await response.json()).cart.itemCount).toBe(3);
  });
});

test("the app can sign in through the website, and sign out", async ({ page, context, request, baseURL }) => {
  await signIn(context, customer, baseURL!);
  const codeVerifier = randomBytes(32).toString("base64url");
  const signInRequest = {
    redirect_uri: "sigmagadgets://auth",
    code_challenge: createHash("sha256").update(codeVerifier).digest("base64url"),
    state: "state-123",
  };
  const requestCode = async () => {
    const response = await page.request.post("/api/mobile/authorize", { form: signInRequest, maxRedirects: 0 });
    expect(response.status()).toBe(303);
    return new URL(response.headers().location);
  };
  let token = "";

  await test.step("the website shows which account the app will use", async () => {
    await page.goto(`/mobile/authorize?${new URLSearchParams(signInRequest)}`);

    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Sign in to the Sigma Gadgets app");
    await expect(page.getByText(customer.email)).toBeVisible();
    await expect(page.getByRole("button", { name: "Continue to the app" })).toBeVisible();
  });

  await test.step("continuing sends a one-time code back to the app", async () => {
    const location = await requestCode();
    const code = location.searchParams.get("code");

    expect(location.protocol).toBe("sigmagadgets:");
    expect(location.searchParams.get("state")).toBe("state-123");
    expect(code).toMatch(/^[A-Za-z0-9_-]{40,}$/);

    const exchange = await request.post("/api/mobile/token", { data: { code, codeVerifier } });
    expect(exchange.status()).toBe(200);
    const body = await exchange.json();
    expect(body.user).toEqual({ id: customer.id, name: customer.name, email: customer.email, image: null });
    expect(new Date(body.expiresAt).getTime()).toBeGreaterThan(Date.now() + 29 * 24 * 60 * 60 * 1000);
    token = body.token;

    const again = await request.post("/api/mobile/token", { data: { code, codeVerifier } });
    expect(again.status(), "a code works only once").toBe(400);
    expect((await again.json()).error.code).toBe("invalid_grant");
  });

  await test.step("the login token works on the API", async () => {
    const me = await request.get("/api/v1/me", { headers: bearer(token) });
    expect((await me.json()).user.email).toBe(customer.email);
    expect((await request.get("/api/v1/cart", { headers: bearer(token) })).status()).toBe(200);
  });

  await test.step("a stolen code is useless without the app's secret", async () => {
    const code = (await requestCode()).searchParams.get("code");
    const thief = await request.post("/api/mobile/token", { data: { code, codeVerifier: randomBytes(32).toString("base64url") } });
    expect(thief.status()).toBe(400);

    const owner = await request.post("/api/mobile/token", { data: { code, codeVerifier } });
    expect(owner.status(), "a failed attempt burns the code").toBe(400);
  });

  await test.step("only the app's own links are accepted", async () => {
    const evilRequest = { ...signInRequest, redirect_uri: "https://evil.example/steal" };
    const evil = await page.request.post("/api/mobile/authorize", { form: evilRequest, maxRedirects: 0 });
    expect(evil.status()).toBe(400);

    await page.goto(`/mobile/authorize?${new URLSearchParams(evilRequest)}`);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("This sign-in link isn't valid");
  });

  await test.step("a signed-out visitor is sent to sign in first", async () => {
    const response = await request.post("/api/mobile/authorize", { form: signInRequest, maxRedirects: 0 });
    expect(response.status()).toBe(303);
    expect(response.headers().location).toContain("/login?callbackUrl=%2Fmobile%2Fauthorize");
  });

  await test.step("live updates are off in tests, and the endpoints say so", async () => {
    expect((await (await request.get("/api/v1/realtime", { headers: bearer(token) })).json()).realtime).toBeNull();
    const channel = { socket_id: "1234.5678", channel_name: `private-cart-${customer.id}` };
    expect((await request.post("/api/v1/realtime/auth", { headers: bearer(token), form: channel })).status()).toBe(503);
    expect((await request.post("/api/v1/realtime/auth", { form: channel })).status()).toBe(401);
  });

  await test.step("signing out ends the token", async () => {
    const signedOut = await request.delete("/api/v1/session", { headers: bearer(token) });
    expect(signedOut.status()).toBe(200);
    expect((await request.get("/api/v1/me", { headers: bearer(token) })).status()).toBe(401);
    expect((await request.delete("/api/v1/session")).status()).toBe(401);
  });
});
