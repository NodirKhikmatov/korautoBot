import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

import { withPgClient } from "./lib/pg.mjs";

const journalPath = "drizzle/migrations/meta/_journal.json";
const journal = JSON.parse(readFileSync(journalPath, "utf8"));

// Remove accidental full-schema migrations (e.g. from db:generate on existing DB)
const validTags = new Set(["0000_initial", "0001_architecture_enhancements"]);
const validEntries = journal.entries.filter((entry) => validTags.has(entry.tag));

if (validEntries.length !== journal.entries.length) {
  console.log(
    "Removed invalid journal entries:",
    journal.entries
      .map((e) => e.tag)
      .filter((tag) => !validTags.has(tag)),
  );
}

await withPgClient(async (client) => {
  await client.query("CREATE SCHEMA IF NOT EXISTS drizzle");
  await client.query(`
    CREATE TABLE IF NOT EXISTS drizzle.__drizzle_migrations (
      id SERIAL PRIMARY KEY,
      hash text NOT NULL,
      created_at bigint
    )
  `);

  const validWhen = new Set(validEntries.map((e) => e.when));
  const allRows = await client.query(
    "SELECT id, hash, created_at FROM drizzle.__drizzle_migrations ORDER BY created_at",
  );

  for (const row of allRows.rows) {
    if (!validWhen.has(Number(row.created_at))) {
      await client.query("DELETE FROM drizzle.__drizzle_migrations WHERE id = $1", [
        row.id,
      ]);
      console.log(`Removed stale journal row: created_at=${row.created_at}`);
    }
  }

  const existing = await client.query(
    "SELECT hash, created_at FROM drizzle.__drizzle_migrations ORDER BY created_at",
  );

  const existingSet = new Set(
    existing.rows.map((row) => `${row.hash}:${row.created_at}`),
  );

  for (const entry of validEntries) {
    const filePath = `drizzle/migrations/${entry.tag}.sql`;
    const content = readFileSync(filePath, "utf8");
    const hash = createHash("sha256").update(content).digest("hex");
    const key = `${hash}:${entry.when}`;

    if (existingSet.has(key)) {
      console.log(`Already recorded: ${entry.tag}`);
      continue;
    }

    await client.query(
      "INSERT INTO drizzle.__drizzle_migrations (hash, created_at) VALUES ($1, $2)",
      [hash, entry.when],
    );
    console.log(`Recorded: ${entry.tag}`);
  }
});

console.log("Done. Run: npm run db:migrate");
