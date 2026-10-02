import { neon } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set. Copy .env.example to .env.local and fill it in.");
  process.exit(1);
}

try {
  const sql = neon(url);
  const [row] = await sql`select current_database() as db, version() as version`;
  console.log(`Connected to database "${row.db}"`);
  console.log(row.version);
} catch (error) {
  console.error("Could not connect to the database:");
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
