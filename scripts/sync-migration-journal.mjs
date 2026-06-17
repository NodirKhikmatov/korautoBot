import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

import { withPgClient } from "./lib/pg.mjs";

const journalPath = "drizzle/migrations/meta/_journal.json";
const journal = JSON.parse(readFileSync(journalPath, "utf8"));

await withPgClient(async (client) => {
  await client.query("CREATE SCHEMA IF NOT EXISTS drizzle");
  await client.query(`
    CREATE TABLE IF NOT EXISTS drizzle.__drizzle_migrations (
      id SERIAL PRIMARY KEY,
      hash text NOT NULL,
      created_at bigint
    )
  `);

  const existing = await client.query(
    "SELECT hash, created_at FROM drizzle.__drizzle_migrations ORDER BY created_at",
  );

  const existingSet = new Set(
    existing.rows.map((row) => `${row.hash}:${row.created_at}`),
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

    await client.query(
      "INSERT INTO drizzle.__drizzle_migrations (hash, created_at) VALUES ($1, $2)",
      [hash, entry.when],
    );

    console.log(`Recorded: ${entry.tag}`);
  }
});

console.log(
  "Migration journal synced. npm run db:migrate will skip applied migrations.",
);
