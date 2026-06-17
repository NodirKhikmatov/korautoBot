import { readFileSync } from "node:fs";
import { config } from "dotenv";
import pg from "pg";

import {
  normalizePgConnectionString,
  pgConnectionStringUsesSsl,
} from "./lib/normalize-connection-string.mjs";

config({ path: ".env.local" });

const SKIPPABLE_CODES = new Set([
  "42701", // duplicate_column
  "42P07", // duplicate_table
  "42710", // duplicate_object
]);

const rawConnectionString = process.env.DATABASE_URL;

if (!rawConnectionString) {
  throw new Error("DATABASE_URL is not set in .env.local");
}

const connectionString = normalizePgConnectionString(rawConnectionString);
const useSsl =
  process.env.DATABASE_SSL === "true" ||
  pgConnectionStringUsesSsl(connectionString);

const pool = new pg.Pool({
  connectionString,
  ssl: useSsl ? { rejectUnauthorized: false } : undefined,
});

const migrationPath = "drizzle/migrations/0009_car_seller_contact.sql";
const raw = readFileSync(migrationPath, "utf8");

const statements = raw
  .split(";")
  .map((part) => part.trim())
  .filter(Boolean);

let applied = 0;
let skipped = 0;

try {
  for (const statement of statements) {
    const preview = statement.slice(0, 70).replace(/\s+/g, " ");

    try {
      await pool.query(statement);
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
    `Migration 0009 finished. Applied: ${applied}, skipped: ${skipped}.`,
  );
} finally {
  await pool.end();
}
