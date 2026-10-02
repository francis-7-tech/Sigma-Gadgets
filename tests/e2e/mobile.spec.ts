import { expect, test } from "@playwright/test";
import { expectNoSideScroll, saveScreen } from "./layout";
import { addToCartDirectly, closeDb, createTestCustomer, removeTestCustomers, signIn } from "./test-customer";

const publicPages = [
  { name: "home", path: "/" },
  { name: "products", path: "/products" },
  { name: "products-search", path: "/products?q=apple&sort=price-asc" },
  { name: "product", path: "/products/apple-macbook-air-13-m2-256gb" },
  { name: "product-illustrative", path: "/products/hp-250-g9-core-i5-512gb" },
  { name: "product-sold-out", path: "/products/jbl-flip-4" },
  { name: "login", path: "/login?callbackUrl=%2Fcart" },
  { name: "credits", path: "/credits" },
  { name: "not-found", path: "/no-such-page" },
];

const signedInPages = [
  { name: "cart", path: "/cart", heading: "Your cart" },
  { name: "checkout", path: "/checkout", heading: "Checkout" },
  { name: "orders", path: "/orders", heading: "My orders" },
];

test.afterAll(async () => {
  await removeTestCustomers();
  await closeDb();
});

for (const { name, path } of publicPages) {
  test(`${name} page fits on a phone`, async ({ page }) => {
    await page.goto(path);
    await page.waitForLoadState("networkidle");
    await expectNoSideScroll(page);
    await saveScreen(page, `phone-${name}`);
  });
}

test("the header stays on one line on small phones", async ({ page }) => {
  for (const width of [360, 390]) {
    await page.setViewportSize({ width, height: 800 });
    await page.goto("/credits");
    const wordmark = page.getByRole("link", { name: "Sigma Gadgets home" }).getByText("Sigma Gadgets");
    expect((await wordmark.boundingBox())!.height, `${width}px: wordmark wraps`).toBeLessThan(40);
    expect(await wordmark.evaluate((el) => el.scrollWidth <= el.clientWidth), `${width}px: wordmark cut off`).toBe(true);
    await expect(page.getByRole("link", { name: "Sign in" })).toBeVisible();
    await expectNoSideScroll(page);
  }
});

test("signed-in pages fit on a phone", async ({ page, context, baseURL }) => {
  await removeTestCustomers();
  const customer = await createTestCustomer();
  await addToCartDirectly(customer, "apple-macbook-air-13-m2-256gb", 1);
  await addToCartDirectly(customer, "xiaomi-redmi-note-14-pro-plus-5g-256gb", 2);
  await signIn(context, customer, baseURL!);

  for (const { name, path, heading } of signedInPages) {
    await test.step(name, async () => {
      await page.goto(path);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(heading);
      await page.waitForLoadState("networkidle");
      await expectNoSideScroll(page);
      await saveScreen(page, `phone-${name}`);
    });
  }
});
