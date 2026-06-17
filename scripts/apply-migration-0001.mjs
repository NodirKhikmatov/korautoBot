import { readFileSync } from "node:fs";

import { withPgClient } from "./lib/pg.mjs";

const SKIPPABLE_CODES = new Set([
  "42710", // duplicate_object (type, constraint, policy)
  "42P07", // duplicate_table
  "42723", // duplicate_function
]);

const migrationPath = "drizzle/migrations/0001_architecture_enhancements.sql";
const raw = readFileSync(migrationPath, "utf8");

const statements = raw
  .split("--> statement-breakpoint")
  .map((part) => part.trim())
  .filter(Boolean);

let applied = 0;
let skipped = 0;

await withPgClient(async (client) => {
  for (const statement of statements) {
    const preview = statement.slice(0, 70).replace(/\s+/g, " ");

    try {
      await client.query(statement);
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
});

console.log(
  `Migration 0001 finished. Applied: ${applied}, skipped: ${skipped}.`,
);
console.log("Run: npm run db:sync-journal");
