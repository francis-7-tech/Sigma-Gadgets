# Sigma Gadgets

An online gadget shop for Nigerian customers. Browse phones, laptops, audio, wearables and accessories, sign in with Google, and pay by bank transfer.

## Features

- Product catalogue with categories, search and sorting
- Google sign-in
- Cart saved to your account
- Checkout with bank transfer instructions; items are held for 48 hours
- Welcome email on first sign-up and a confirmation email for every order
- Unpaid orders are cancelled automatically and their stock is restored
- Order history and order status pages
- Mobile-first design

## Tech stack

| | |
|---|---|
| Framework | Next.js 16 (App Router), React, TypeScript |
| Styling | Tailwind CSS |
| Database | Neon Postgres with Drizzle ORM |
| Auth | Auth.js with Google |
| Email | Brevo |
| Images | Cloudinary |
| Tests | Vitest, Playwright |
| Hosting | Vercel, with Vercel Cron |

## Getting started

1. Install Node.js 22.18 or newer.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env.local` and fill it in (see [Environment variables](#environment-variables)).
4. Create the tables and load the products:
   ```bash
   npm run db:migrate
   npm run db:seed
   ```
5. Start the app and open http://localhost:3000:
   ```bash
   npm run dev
   ```

## Environment variables

| Variable | Where to get it |
|---|---|
| `DATABASE_URL` | Neon → your project → Connect → connection string |
| `APP_URL` | Site address used in email links: `http://localhost:3000` locally |
| `AUTH_SECRET` | Run `npx auth secret`, or any random 32-byte base64 string |
| `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET` | Google Cloud Console → Google Auth Platform → Clients → Web application. Redirect URI: `http://localhost:3000/api/auth/callback/google` |
| `BREVO_API_KEY` | Brevo → SMTP & API → API keys |
| `EMAIL_FROM_NAME`, `EMAIL_FROM_ADDRESS` | Sender name and an address verified in Brevo |
| `EMAIL_DRY_RUN` | `true` prints emails to the terminal instead of sending them |
| `CRON_SECRET` | Any long random string |
| `DELIVERY_FEE_NAIRA` | Flat delivery fee, e.g. `5000` |
| `BANK_NAME`, `BANK_ACCOUNT_NAME`, `BANK_ACCOUNT_NUMBER` | Bank details shown to customers |
| `SHOP_WHATSAPP` | WhatsApp number shown to customers |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Cloudinary dashboard → Cloud name |

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run lint` | Lint the code |
| `npm test` | Unit tests |
| `npm run test:e2e` | Browser tests (builds the app first) |
| `npm run test:e2e:report` | Open the last browser test report |
| `npm run db:check` | Test the database connection |
| `npm run db:generate` | Create a migration from `src/db/schema.ts` |
| `npm run db:migrate` | Apply migrations |
| `npm run db:seed` | Load or update categories and products |
| `npm run db:studio` | Open Drizzle Studio |

## Tests

- **Unit tests** cover the welcome email (sent exactly once), checkout form rules, safe redirects, image URLs and money formatting.
- **Browser tests** place a real order from product page to bank transfer instructions, and check every page at phone size.

Browser tests run against the database in `.env.local`. They create a test customer, then delete it along with its orders. First-time setup:

```bash
npx playwright install chromium
```

## Managing the shop

- **Add or edit a product:** edit `src/db/seed.ts`, then run `npm run db:seed`.
- **Add photos:** upload them to Cloudinary, add their Public IDs to the product's `images` in `seed.ts`, then run `npm run db:seed`.
- **Confirm or ship orders, change stock:** run `npm run db:studio` and edit the `orders` or `products` table.

## Deployment (Vercel)

1. Push the repo to GitHub and import it in Vercel.
2. Add every environment variable from `.env.local`, with `EMAIL_DRY_RUN=false`.
3. Deploy, then set `APP_URL` to your Vercel address and redeploy.
4. In Google Auth Platform, add your Vercel address as an authorised JavaScript origin, and add `https://<your-domain>/api/auth/callback/google` as a redirect URI.
5. In Google Auth Platform → Audience, click **Publish app** so anyone can sign in.

The auto-cancel job runs daily from `vercel.json`.

## Photo credits

Product photos are from Wikimedia Commons and Pexels. Full credits are on the `/credits` page.
