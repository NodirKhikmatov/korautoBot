import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import pg from "pg";

import {
  normalizePgConnectionString,
  pgConnectionStringUsesSsl,
} from "./lib/normalize-connection-string.mjs";

const rawConnectionString = process.env.DATABASE_URL;

if (!rawConnectionString) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

const connectionString = normalizePgConnectionString(rawConnectionString);
const useSsl =
  process.env.DATABASE_SSL === "true" ||
  pgConnectionStringUsesSsl(connectionString);

const pool = new pg.Pool({
  connectionString,
  ssl: useSsl ? { rejectUnauthorized: false } : undefined,
});

const db = drizzle(pool);
const migrationsFolder = join(
  dirname(fileURLToPath(import.meta.url)),
  "../drizzle/migrations",
);

try {
  console.log("Running database migrations...");
  await migrate(db, { migrationsFolder });
  console.log("Migrations complete.");
} catch (error) {
  console.error("Migration failed:", error);
  process.exit(1);
} finally {
  await pool.end();
}
