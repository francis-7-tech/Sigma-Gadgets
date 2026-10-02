import { sql } from "drizzle-orm";
import {
  bigint,
  boolean,
  check,
  index,
  integer,
  jsonb,
  pgEnum,
  pgSequence,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

const createdAt = () => timestamp({ withTimezone: true }).notNull().defaultNow();
const updatedAt = () =>
  timestamp({ withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date());
const kobo = () => bigint({ mode: "number" });

export const users = pgTable("users", {
  id: text()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text(),
  email: text().unique(),
  emailVerified: timestamp({ withTimezone: true, mode: "date" }),
  image: text(),
  welcomeEmailSentAt: timestamp({ withTimezone: true }),
  createdAt: createdAt(),
});

export const accounts = pgTable(
  "accounts",
  {
    userId: text()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text().$type<"oauth" | "oidc" | "email" | "webauthn">().notNull(),
    provider: text().notNull(),
    providerAccountId: text().notNull(),
    refresh_token: text(),
    access_token: text(),
    expires_at: integer(),
    token_type: text(),
    scope: text(),
    id_token: text(),
    session_state: text(),
  },
  (t) => [primaryKey({ columns: [t.provider, t.providerAccountId] })],
);

export const sessions = pgTable("sessions", {
  sessionToken: text().primaryKey(),
  userId: text()
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp({ withTimezone: true, mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: text().notNull(),
    token: text().notNull(),
    expires: timestamp({ withTimezone: true, mode: "date" }).notNull(),
  },
  (t) => [primaryKey({ columns: [t.identifier, t.token] })],
);

export const categories = pgTable("categories", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: text().notNull(),
  slug: text().notNull().unique(),
  sortOrder: integer().notNull().default(0),
});

export type ProductSpec = { label: string; value: string };

export const products = pgTable(
  "products",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    name: text().notNull(),
    slug: text().notNull().unique(),
    description: text().notNull(),
    specs: jsonb().$type<ProductSpec[]>().notNull().default([]),
    priceKobo: kobo().notNull(),
    stock: integer().notNull().default(0),
    images: text().array().notNull().default(sql`'{}'::text[]`),
    illustrativePhoto: boolean().notNull().default(false),
    categoryId: integer()
      .notNull()
      .references(() => categories.id),
    featured: boolean().notNull().default(false),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index().on(t.categoryId),
    check("products_price_non_negative", sql`${t.priceKobo} >= 0`),
    check("products_stock_non_negative", sql`${t.stock} >= 0`),
  ],
);

export const cartItems = pgTable(
  "cart_items",
  {
    userId: text()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    productId: integer()
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    quantity: integer().notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    primaryKey({ columns: [t.userId, t.productId] }),
    check("cart_items_quantity_positive", sql`${t.quantity} > 0`),
  ],
);

export const orderStatus = pgEnum("order_status", [
  "pending",
  "confirmed",
  "shipped",
  "delivered",
  "cancelled",
]);

export const paymentMethod = pgEnum("payment_method", ["bank_transfer"]);

export const orderNumberSeq = pgSequence("order_number_seq", { startWith: 10001 });

export const orders = pgTable(
  "orders",
  {
    id: uuid().primaryKey().defaultRandom(),
    orderNumber: text()
      .notNull()
      .unique()
      .default(sql`'SG-' || nextval('order_number_seq')`),
    userId: text()
      .notNull()
      .references(() => users.id),
    status: orderStatus().notNull().default("pending"),
    paymentMethod: paymentMethod().notNull().default("bank_transfer"),
    subtotalKobo: kobo().notNull(),
    deliveryFeeKobo: kobo().notNull(),
    totalKobo: kobo().notNull(),
    shippingName: text().notNull(),
    shippingPhone: text().notNull(),
    shippingAddress: text().notNull(),
    shippingCity: text().notNull(),
    shippingState: text().notNull(),
    expiresAt: timestamp({ withTimezone: true }).notNull(),
    emailSentAt: timestamp({ withTimezone: true }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index().on(t.userId, t.createdAt),
    index().on(t.status, t.expiresAt),
  ],
);

export const orderItems = pgTable(
  "order_items",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    orderId: uuid()
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    productId: integer().references(() => products.id, { onDelete: "set null" }),
    productName: text().notNull(),
    unitPriceKobo: kobo().notNull(),
    quantity: integer().notNull(),
  },
  (t) => [
    index().on(t.orderId),
    check("order_items_quantity_positive", sql`${t.quantity} > 0`),
  ],
);
