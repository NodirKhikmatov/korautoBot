import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";

config({ path: ".env.local" });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set in .env.local");
}

const sql = neon(connectionString);
const journalPath = "drizzle/migrations/meta/_journal.json";
const journal = JSON.parse(readFileSync(journalPath, "utf8"));

await sql`CREATE SCHEMA IF NOT EXISTS drizzle`;
await sql`
  CREATE TABLE IF NOT EXISTS drizzle.__drizzle_migrations (
    id SERIAL PRIMARY KEY,
    hash text NOT NULL,
    created_at bigint
  )
`;

const existing = await sql`
  SELECT hash, created_at FROM drizzle.__drizzle_migrations ORDER BY created_at
`;

const existingSet = new Set(
  existing.map((row) => `${row.hash}:${row.created_at}`),
);

for (const entry of journal.entries) {
  const filePath = `drizzle/migrations/${entry.tag}.sql`;
  const content = readFileSync(filePath, "utf8");
  const hash = createHash("sha256").update(content).digest("hex");
  const key = `${hash}:${entry.when}`;

  if (existingSet.has(key)) {
    console.log(`Already recorded: ${entry.tag}`);
    continue;
  }

  await sql`
    INSERT INTO drizzle.__drizzle_migrations (hash, created_at)
    VALUES (${hash}, ${entry.when})
  `;

  console.log(`Recorded: ${entry.tag}`);
}

console.log("Migration journal synced. npm run db:migrate will skip applied migrations.");
