# Sigma Gadgets

Online gadget shop for Nigerian customers: Next.js, Neon Postgres (Drizzle), Auth.js with Google sign-in, and Brevo email. 

## Getting started

1. Install Node.js 22.18 or newer.
2. Install dependencies:

   ```bash
   npm install
   ```

3. Copy `.env.example` to `.env.local` and fill in the values. You need at least `DATABASE_URL` to start.
4. Check the database connection:

   ```bash
   npm run db:check
   ```

5. Start the dev server and open http://localhost:3000:

   ```bash
   npm run dev
   ```

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run lint` | Lint the code |
| `npm run db:check` | Test the connection to Neon |
| `npm run db:generate` | Create a migration from `src/db/schema.ts` |
| `npm run db:migrate` | Apply migrations to the database |
| `npm run db:seed` | Load or update categories and products from `src/db/seed.ts` |
| `npm run db:studio` | Open Drizzle Studio to view and edit data (orders, stock) |
| `npm test` | Run unit tests |
