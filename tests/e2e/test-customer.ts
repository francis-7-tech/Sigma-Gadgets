import { randomUUID } from "node:crypto";
import { Pool } from "@neondatabase/serverless";
import { and, eq, inArray, like, ne, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-serverless";
import type { BrowserContext } from "@playwright/test";
import * as schema from "@/db/schema";

const { cartItems, orderItems, orders, products, sessions, users } = schema;

const TEST_EMAIL_DOMAIN = "sigma-gadgets.test";

let pool: Pool | undefined;
let database: ReturnType<typeof connect> | undefined;

function connect(client: Pool) {
  return drizzle({ client, schema, casing: "snake_case" });
}

export function getDb() {
  pool ??= new Pool({ connectionString: process.env.DATABASE_URL });
  database ??= connect(pool);
  return database;
}

export type TestCustomer = { id: string; email: string; name: string; sessionToken: string };

export async function createTestCustomer(): Promise<TestCustomer> {
  const email = `e2e-${Date.now()}@${TEST_EMAIL_DOMAIN}`;
  const name = "Ada Tester";
  const [user] = await getDb()
    .insert(users)
    .values({ email, name, emailVerified: new Date(), welcomeEmailSentAt: new Date() })
    .returning({ id: users.id });

  const sessionToken = randomUUID();
  await getDb().insert(sessions).values({ sessionToken, userId: user.id, expires: new Date(Date.now() + 24 * 60 * 60 * 1000) });
  return { id: user.id, email, name, sessionToken };
}

export async function signIn(context: BrowserContext, customer: TestCustomer, baseURL: string) {
  await context.addCookies([
    { name: "authjs.session-token", value: customer.sessionToken, url: baseURL, httpOnly: true, sameSite: "Lax" },
  ]);
}

export async function addToCartDirectly(customer: TestCustomer, productSlug: string, quantity: number) {
  const product = await getProduct(productSlug);
  await getDb().insert(cartItems).values({ userId: customer.id, productId: product.id, quantity });
}

export async function getProduct(slug: string) {
  const [product] = await getDb().select().from(products).where(eq(products.slug, slug));
  if (!product) throw new Error(`Product ${slug} not found. Run npm run db:seed.`);
  return product;
}

export async function getCartLines(customer: TestCustomer) {
  return getDb().select().from(cartItems).where(eq(cartItems.userId, customer.id));
}

export async function removeTestCustomers() {
  await getDb().transaction(async (tx) => {
    const testUsers = await tx
      .select({ id: users.id })
      .from(users)
      .where(like(users.email, `%@${TEST_EMAIL_DOMAIN}`));
    if (testUsers.length === 0) return;
    const userIds = testUsers.map((u) => u.id);

    const lines = await tx
      .select({ productId: orderItems.productId, quantity: orderItems.quantity })
      .from(orderItems)
      .innerJoin(orders, eq(orderItems.orderId, orders.id))
      .where(and(inArray(orders.userId, userIds), ne(orders.status, "cancelled")));
    for (const line of lines) {
      if (line.productId === null) continue;
      await tx
        .update(products)
        .set({ stock: sql`${products.stock} + ${line.quantity}` })
        .where(eq(products.id, line.productId));
    }

    await tx.delete(orders).where(inArray(orders.userId, userIds));
    await tx.delete(users).where(inArray(users.id, userIds));
  });
}

export async function closeDb() {
  await pool?.end();
  pool = undefined;
  database = undefined;
}
