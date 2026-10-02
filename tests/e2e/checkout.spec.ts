import { expect, test } from "@playwright/test";
import { formatNaira } from "@/lib/money";
import { deliveryFeeKobo } from "@/lib/site";
import { orders } from "@/db/schema";
import { eq } from "drizzle-orm";
import { expectNoSideScroll, saveScreen } from "./layout";
import {
  closeDb,
  createTestCustomer,
  getDb,
  getCartLines,
  getProduct,
  removeTestCustomers,
  signIn,
  type TestCustomer,
} from "./test-customer";

const PRODUCT = "jbl-go-2";
let customer: TestCustomer;

test.beforeAll(async () => {
  await removeTestCustomers();
  customer = await createTestCustomer();
});

test.afterAll(async () => {
  await removeTestCustomers();
  await closeDb();
});

test("a signed-in customer can order a gadget and gets bank transfer instructions", async ({ page, context, baseURL, browser }) => {
  const before = await getProduct(PRODUCT);
  expect(before.stock, `${PRODUCT} needs stock for this test (set it in Drizzle Studio)`).toBeGreaterThan(0);
  const total = before.priceKobo + deliveryFeeKobo;
  await signIn(context, customer, baseURL!);

  await test.step("add the gadget to the cart from its page", async () => {
    await page.goto(`/products/${PRODUCT}`);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(before.name);
    await page.getByRole("button", { name: "Add to cart" }).click();
    await expect(page.getByText("Added to cart")).toBeVisible();
  });

  await test.step("the cart shows the right total", async () => {
    await page.goto("/cart");
    const summary = page.getByRole("complementary", { name: "Order summary" });
    await expect(summary).toContainText(formatNaira(before.priceKobo));
    await expect(summary).toContainText(formatNaira(total));
    await summary.getByRole("link", { name: "Checkout" }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Checkout");
  });

  await test.step("an incomplete form explains what's missing", async () => {
    await page.getByLabel("Full name").fill("");
    await page.getByRole("button", { name: "Place order" }).click();
    await expect(page.getByText("Enter your full name")).toBeVisible();
    await expect(page.getByText("Enter a valid phone number, e.g. 0803 000 0000")).toBeVisible();
    await expect(page.getByText("Enter your street address")).toBeVisible();
    await expect(page.getByText("Enter your city or area")).toBeVisible();
    await expect(page).toHaveURL(/\/checkout$/);
  });

  await test.step("a complete form places the order", async () => {
    await page.getByLabel("Full name").fill("Ada Tester");
    await page.getByLabel("Phone number").fill("0803 000 0000");
    await page.getByLabel("Street address").fill("12 Admiralty Way, Lekki Phase 1");
    await page.getByLabel("City or area").fill("Lekki");
    await page.getByLabel("State").selectOption("Lagos");
    await page.getByRole("button", { name: "Place order" }).click();
    await expect(page).toHaveURL(/\/orders\/[0-9a-f-]{36}$/);
  });

  const orderUrl = page.url();
  const [order] = await getDb().select().from(orders).where(eq(orders.userId, customer.id));

  await test.step("the order page shows how to pay", async () => {
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Order placed. Now complete your payment.");
    await expect(page.getByText("Awaiting payment")).toBeVisible();
    const payment = page.getByRole("region", { name: "Payment details" });
    await expect(payment).toContainText(formatNaira(total));
    await expect(payment).toContainText(process.env.BANK_ACCOUNT_NUMBER ?? "Not set");
    await expect(payment).toContainText(order.orderNumber);
    await expect(page.getByText("12 Admiralty Way, Lekki Phase 1, Lekki, Lagos")).toBeVisible();
  });

  await test.step("the database was updated in one go", async () => {
    expect(order.orderNumber).toMatch(/^SG-\d{5,}$/);
    expect(order.status).toBe("pending");
    expect(order.totalKobo).toBe(total);
    const hoursToPay = (order.expiresAt.getTime() - order.createdAt.getTime()) / 3_600_000;
    expect(hoursToPay).toBeCloseTo(48, 1);
    expect((await getProduct(PRODUCT)).stock).toBe(before.stock - 1);
    expect(await getCartLines(customer)).toHaveLength(0);
  });

  await test.step("the order page fits on a phone", async () => {
    await page.setViewportSize({ width: 390, height: 844 });
    await expectNoSideScroll(page);
    await saveScreen(page, "phone-order");
  });

  await test.step("another customer can't open this order", async () => {
    const stranger = await createTestCustomer();
    const otherContext = await browser.newContext();
    await signIn(otherContext, stranger, baseURL!);
    const otherPage = await otherContext.newPage();
    await otherPage.goto(orderUrl);
    await expect(otherPage.getByRole("heading", { level: 1 })).toHaveText("Page not found");
    await otherContext.close();
  });
});
