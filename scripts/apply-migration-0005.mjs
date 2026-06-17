import { readFileSync } from "node:fs";
import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";

config({ path: ".env.local" });

const SKIPPABLE_CODES = new Set([
  "42701", // duplicate_column
  "42P07", // duplicate_table
  "42710", // duplicate_object
]);

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set in .env.local");
}

const sql = neon(connectionString);
const migrationPath = "drizzle/migrations/0005_car_seller_contact.sql";
const raw = readFileSync(migrationPath, "utf8");

const statements = raw
  .split(";")
  .map((part) => part.trim())
  .filter(Boolean);

let applied = 0;
let skipped = 0;

for (const statement of statements) {
  const preview = statement.slice(0, 70).replace(/\s+/g, " ");

  try {
    await sql(statement);
    console.log(`Applied: ${preview}...`);
    applied += 1;
  } catch (error) {
    if (error && SKIPPABLE_CODES.has(error.code)) {
      console.log(`Skipped (exists): ${preview}...`);
      skipped += 1;
      continue;
    }

    throw error;
  }
}

console.log(
  `Migration 0005 finished. Applied: ${applied}, skipped: ${skipped}.`,
);
