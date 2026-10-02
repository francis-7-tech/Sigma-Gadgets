import { inArray, sql } from "drizzle-orm";
import { nairaToKobo } from "../lib/money";
import { db } from "./client";
import { categories, products, type ProductSpec } from "./schema";

type SeedCategory = { name: string; slug: string };

type SeedProduct = {
  name: string;
  slug: string;
  category: string;
  priceNaira: number;
  initialStock: number;
  featured?: boolean;
  description: string;
  specs: ProductSpec[];
  images?: string[];
  illustrativePhoto?: boolean;
};

const seedCategories: SeedCategory[] = [
  { name: "Phones", slug: "phones" },
  { name: "Laptops", slug: "laptops" },
  { name: "Audio", slug: "audio" },
  { name: "Wearables", slug: "wearables" },
  { name: "Accessories", slug: "accessories" },
];

const seedProducts: SeedProduct[] = [
  {
    name: "Samsung Galaxy A55 5G, 8GB / 128GB",
    slug: "samsung-galaxy-a55-5g-128gb",
    category: "phones",
    priceNaira: 485_000,
    initialStock: 6,
    featured: true,
    description:
      "A bright 6.6-inch 120Hz screen, a 50MP main camera and a 5,000mAh battery that lasts all day, in a metal frame rated IP67 for water and dust.",
    specs: [
      { label: "Display", value: '6.6" Super AMOLED, 120Hz' },
      { label: "Processor", value: "Exynos 1480" },
      { label: "Memory", value: "8GB RAM, 128GB storage" },
      { label: "Main camera", value: "50MP" },
      { label: "Battery", value: "5,000mAh, 25W charging" },
      { label: "Network", value: "5G, dual SIM" },
    ],
    images: ["fronti"],
  },
  {
    name: "Samsung Galaxy A15, 4GB / 128GB",
    slug: "samsung-galaxy-a15-128gb",
    category: "phones",
    priceNaira: 165_000,
    initialStock: 10,
    description:
      "An affordable everyday phone with a smooth Super AMOLED screen, a 50MP camera and a big 5,000mAh battery.",
    specs: [
      { label: "Display", value: '6.5" Super AMOLED, 90Hz' },
      { label: "Processor", value: "MediaTek Helio G99" },
      { label: "Memory", value: "4GB RAM, 128GB storage" },
      { label: "Main camera", value: "50MP" },
      { label: "Battery", value: "5,000mAh, 25W charging" },
    ],
    images: ["front", "back"],
  },
  {
    name: "Apple iPhone 15, 128GB",
    slug: "apple-iphone-15-128gb",
    category: "phones",
    priceNaira: 1_150_000,
    initialStock: 3,
    featured: true,
    description:
      "Dynamic Island, a 48MP main camera and USB-C charging, powered by the A16 Bionic chip.",
    specs: [
      { label: "Display", value: '6.1" Super Retina XDR' },
      { label: "Chip", value: "A16 Bionic" },
      { label: "Storage", value: "128GB" },
      { label: "Main camera", value: "48MP" },
      { label: "Charging", value: "USB-C" },
    ],
    images: ["backi"],
  },
  {
    name: "Apple iPhone 13, 128GB",
    slug: "apple-iphone-13-128gb",
    category: "phones",
    priceNaira: 720_000,
    initialStock: 2,
    description:
      "A dependable iPhone with the A15 Bionic chip, a dual 12MP camera system and Face ID.",
    specs: [
      { label: "Display", value: '6.1" Super Retina XDR' },
      { label: "Chip", value: "A15 Bionic" },
      { label: "Storage", value: "128GB" },
      { label: "Cameras", value: "Dual 12MP (wide + ultra wide)" },
      { label: "Unlock", value: "Face ID" },
    ],
    images: ["frontyy", "backy"],
  },
  {
    name: "Xiaomi Redmi Note 14 Pro+ 5G, 8GB / 256GB",
    slug: "xiaomi-redmi-note-14-pro-plus-5g-256gb",
    category: "phones",
    priceNaira: 520_000,
    initialStock: 8,
    description:
      "A 200MP main camera, a bright curved AMOLED screen and 120W HyperCharge that refills the 5,110mAh battery in minutes.",
    specs: [
      { label: "Display", value: '6.67" 1.5K AMOLED, 120Hz' },
      { label: "Processor", value: "Snapdragon 7s Gen 3" },
      { label: "Memory", value: "8GB RAM, 256GB storage" },
      { label: "Main camera", value: "200MP" },
      { label: "Battery", value: "5,110mAh, 120W HyperCharge" },
    ],
    images: ["xiaomiredmi_front"],
  },

  {
    name: 'Apple MacBook Air 13" M2, 8GB / 256GB',
    slug: "apple-macbook-air-13-m2-256gb",
    category: "laptops",
    priceNaira: 1_350_000,
    initialStock: 2,
    featured: true,
    description:
      "Thin, light and silent with no fan. The M2 chip handles everyday work, study and photo editing with ease.",
    specs: [
      { label: "Display", value: '13.6" Liquid Retina' },
      { label: "Chip", value: "Apple M2" },
      { label: "Memory", value: "8GB unified memory" },
      { label: "Storage", value: "256GB SSD" },
      { label: "Charging", value: "MagSafe 3" },
    ],
    images: ["fronty", "lid"],
  },
  {
    name: "HP 250 G9, Core i5 / 8GB / 512GB",
    slug: "hp-250-g9-core-i5-512gb",
    category: "laptops",
    priceNaira: 620_000,
    initialStock: 4,
    description:
      "A practical 15.6-inch laptop for work and school, with a 12th-gen Intel Core i5 and a fast 512GB SSD.",
    specs: [
      { label: "Display", value: '15.6" Full HD' },
      { label: "Processor", value: "Intel Core i5-1235U" },
      { label: "Memory", value: "8GB RAM" },
      { label: "Storage", value: "512GB SSD" },
      { label: "Operating system", value: "Windows 11" },
    ],
    illustrativePhoto: true,
    images: ["hpcore_illustrative"],
  },
  {
    name: "Dell XPS 13 (9350), Core i5 / 8GB / 256GB",
    slug: "dell-xps-13-9350-core-i5-256gb",
    category: "laptops",
    priceNaira: 450_000,
    initialStock: 3,
    description:
      "A compact 13.3-inch laptop with Dell's thin-bezel InfinityEdge screen, an aluminium and carbon-fibre body, and a fast SSD.",
    specs: [
      { label: "Display", value: '13.3" Full HD InfinityEdge' },
      { label: "Processor", value: "Intel Core i5-6200U" },
      { label: "Memory", value: "8GB RAM" },
      { label: "Storage", value: "256GB SSD" },
      { label: "Operating system", value: "Windows 10" },
    ],
    images: ["dellxps13_front"],
  },
  {
    name: "Lenovo ThinkPad X1 Carbon, Core i7 / 16GB / 512GB",
    slug: "lenovo-thinkpad-x1-carbon-core-i7-512gb",
    category: "laptops",
    priceNaira: 780_000,
    initialStock: 2,
    description:
      "Lenovo's lightweight business laptop: a carbon-fibre build, the famous ThinkPad keyboard and TrackPoint, and all-day performance.",
    specs: [
      { label: "Display", value: '14"' },
      { label: "Processor", value: "Intel Core i7" },
      { label: "Memory", value: "16GB RAM" },
      { label: "Storage", value: "512GB SSD" },
      { label: "Weight", value: "Around 1.1kg" },
    ],
    images: ["lenovothinkpad_front"],
  },

  {
    name: "Samsung Galaxy Buds (2019)",
    slug: "samsung-galaxy-buds-2019",
    category: "audio",
    priceNaira: 45_000,
    initialStock: 15,
    featured: true,
    description: "Compact true wireless earbuds with sound tuned by AKG and a case that charges wirelessly.",
    specs: [
      { label: "Sound", value: "Tuned by AKG" },
      { label: "Battery", value: "Up to 6 hours, 13 hours with case" },
      { label: "Charging", value: "Wireless (Qi) or USB-C case" },
      { label: "Connection", value: "Bluetooth 5.0" },
    ],
    images: ["samsungbuds_front"],
  },
  {
    name: "Sony WH-CH720N Wireless Headphones",
    slug: "sony-wh-ch720n",
    category: "audio",
    priceNaira: 135_000,
    initialStock: 5,
    featured: true,
    description:
      "Lightweight over-ear headphones with noise cancelling and up to 35 hours of battery life.",
    specs: [
      { label: "Noise cancellation", value: "Active (ANC)" },
      { label: "Battery", value: "Up to 35 hours (ANC on)" },
      { label: "Weight", value: "192g" },
      { label: "Connection", value: "Bluetooth 5.2" },
    ],
    illustrativePhoto: true,
    images: ["pexels-sound-on-3394650"],
  },
  {
    name: "Apple AirPods 4",
    slug: "apple-airpods-4",
    category: "audio",
    priceNaira: 230_000,
    initialStock: 4,
    description: "Apple's open-fit earbuds with Personalised Spatial Audio and a USB-C charging case.",
    specs: [
      { label: "Audio", value: "Personalised Spatial Audio" },
      { label: "Battery", value: "Up to 30 hours with case" },
      { label: "Charging", value: "USB-C case" },
    ],
    images: ["frontss"],
  },
  {
    name: "JBL Flip 4 Portable Speaker",
    slug: "jbl-flip-4",
    category: "audio",
    priceNaira: 75_000,
    initialStock: 0,
    description: "A rugged, waterproof Bluetooth speaker with bold JBL sound and a built-in speakerphone.",
    specs: [
      { label: "Battery", value: "Up to 12 hours" },
      { label: "Protection", value: "IPX7 waterproof" },
      { label: "Connection", value: "Bluetooth 4.2" },
    ],
    images: ["jblflip4_front"],
  },
  {
    name: "JBL GO 2 Portable Speaker",
    slug: "jbl-go-2",
    category: "audio",
    priceNaira: 28_000,
    initialStock: 12,
    description: "A pocket-sized waterproof speaker for music anywhere, with a built-in speakerphone.",
    specs: [
      { label: "Battery", value: "Up to 5 hours" },
      { label: "Protection", value: "IPX7 waterproof" },
      { label: "Connection", value: "Bluetooth 4.1" },
    ],
    images: ["jblgo2_front"],
  },

  {
    name: "Apple Watch SE (2nd gen), 40mm GPS",
    slug: "apple-watch-se-2-40mm-gps",
    category: "wearables",
    priceNaira: 265_000,
    initialStock: 3,
    featured: true,
    description: "Fitness tracking, notifications and Crash Detection on a bright Retina display.",
    specs: [
      { label: "Case size", value: "40mm" },
      { label: "Connectivity", value: "GPS" },
      { label: "Safety", value: "Crash Detection, Fall Detection" },
      { label: "Water resistance", value: "50m" },
      { label: "Battery", value: "Up to 18 hours" },
    ],
    images: ["fronts", "backs"],
  },
  {
    name: "Samsung Galaxy Watch6, 40mm",
    slug: "samsung-galaxy-watch6-40mm",
    category: "wearables",
    priceNaira: 280_000,
    initialStock: 3,
    description:
      "A Wear OS smartwatch with a Super AMOLED display, sleep coaching and body composition tracking.",
    specs: [
      { label: "Case size", value: "40mm" },
      { label: "Display", value: "Super AMOLED" },
      { label: "Software", value: "Wear OS" },
      { label: "Water resistance", value: "5ATM + IP68" },
    ],
    images: ["frontt"],
  },
  {
    name: "Xiaomi Smart Band 8",
    slug: "xiaomi-smart-band-8",
    category: "wearables",
    priceNaira: 35_000,
    initialStock: 7,
    description: "A slim fitness band with a bright AMOLED screen, sleep and heart-rate tracking, and up to 16 days of battery.",
    specs: [
      { label: "Display", value: '1.62" AMOLED' },
      { label: "Battery", value: "Up to 16 days" },
      { label: "Water resistance", value: "5ATM" },
      { label: "Workouts", value: "150+ sports modes" },
    ],
    images: ["xioamismartband_front"],
  },

  {
    name: "Anker PowerCore 10000 Power Bank",
    slug: "anker-powercore-10000",
    category: "accessories",
    priceNaira: 25_000,
    initialStock: 12,
    featured: true,
    description: "A compact 10,000mAh power bank, about the size of a deck of cards, that charges most phones at least twice.",
    specs: [
      { label: "Capacity", value: "10,000mAh" },
      { label: "Charging tech", value: "PowerIQ and VoltageBoost" },
      { label: "Weight", value: "About 180g" },
    ],
    images: ["ankerpowercore_front"],
  },
  {
    name: "Xiaomi 50W Power Bank, 20000mAh",
    slug: "xiaomi-50w-power-bank-20000",
    category: "accessories",
    priceNaira: 40_000,
    initialStock: 20,
    description: "A high-capacity 20,000mAh power bank with up to 50W output, fast enough for phones and many laptops.",
    specs: [
      { label: "Capacity", value: "20,000mAh" },
      { label: "Max output", value: "50W" },
      { label: "Ports", value: "1 × USB-C, 2 × USB-A" },
    ],
    images: ["xioamipowerbank_front"],
  },
  {
    name: "Samsung 25W USB-C Charger",
    slug: "samsung-25w-usb-c-charger",
    category: "accessories",
    priceNaira: 18_000,
    initialStock: 25,
    description: "Super Fast Charging for Samsung Galaxy phones, and works with other USB-C devices.",
    specs: [
      { label: "Power", value: "25W" },
      { label: "Port", value: "USB-C" },
    ],
    images: ["sfront"],
  },
  {
    name: "Apple 96W USB-C Power Adapter",
    slug: "apple-96w-usb-c-power-adapter",
    category: "accessories",
    priceNaira: 95_000,
    initialStock: 6,
    description: "Apple's 96W charger for the 16-inch MacBook Pro. It also fast-charges other USB-C laptops, tablets and phones.",
    specs: [
      { label: "Power", value: "96W" },
      { label: "Port", value: "USB-C (cable sold separately)" },
      { label: "Designed for", value: '16" MacBook Pro' },
    ],
    images: ["appleadapter_front"],
  },
];

const removedSlugs = [
  "tecno-spark-20-pro-256gb",
  "dell-inspiron-15-3520-core-i5-512gb",
  "lenovo-ideapad-slim-3-ryzen-5-512gb",
  "oraimo-freepods-4",
  "jbl-flip-6",
  "jbl-go-4",
  "xiaomi-redmi-watch-4",
  "anker-powercore-essential-20000",
  "oraimo-traveler-4-20000",
  "apple-20w-usb-c-power-adapter",
];

async function main() {
  console.log(`Seeding ${seedCategories.length} categories and ${seedProducts.length} products...`);

  await db.transaction(async (tx) => {
    const savedCategories = await tx
      .insert(categories)
      .values(seedCategories.map((c, i) => ({ ...c, sortOrder: i })))
      .onConflictDoUpdate({
        target: categories.slug,
        set: { name: sql`excluded.name`, sortOrder: sql`excluded.sort_order` },
      })
      .returning({ id: categories.id, slug: categories.slug });

    const categoryIdBySlug = new Map(savedCategories.map((c) => [c.slug, c.id]));

    const rows = seedProducts.map((p) => {
      const categoryId = categoryIdBySlug.get(p.category);
      if (!categoryId) throw new Error(`Unknown category "${p.category}" for product "${p.slug}"`);
      return {
        name: p.name,
        slug: p.slug,
        description: p.description,
        specs: p.specs,
        priceKobo: nairaToKobo(p.priceNaira),
        stock: p.initialStock,
        images: p.images ?? [],
        illustrativePhoto: p.illustrativePhoto ?? false,
        categoryId,
        featured: p.featured ?? false,
      };
    });

    const removed = await tx
      .delete(products)
      .where(inArray(products.slug, removedSlugs))
      .returning({ slug: products.slug });
    if (removed.length) console.log(`Removed ${removed.length} old products: ${removed.map((r) => r.slug).join(", ")}`);

    await tx
      .insert(products)
      .values(rows)
      .onConflictDoUpdate({
        target: products.slug,
        set: {
          name: sql`excluded.name`,
          description: sql`excluded.description`,
          specs: sql`excluded.specs`,
          priceKobo: sql`excluded.price_kobo`,
          images: sql`excluded.images`,
          illustrativePhoto: sql`excluded.illustrative_photo`,
          categoryId: sql`excluded.category_id`,
          featured: sql`excluded.featured`,
          updatedAt: sql`now()`,
        },
      });
  });

  console.log("Done.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => db.$client.end());
