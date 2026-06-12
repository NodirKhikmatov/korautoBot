import { drizzle } from "drizzle-orm/node-postgres";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import * as schema from "./schema";

type Database = NodePgDatabase<typeof schema>;

function createPool(): Pool {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  const useSsl =
    process.env.DATABASE_SSL === "true" ||
    /sslmode=(require|verify-full|verify-ca|prefer)/i.test(connectionString);

  return new Pool({
    connectionString,
    max: Number(process.env.DATABASE_POOL_MAX ?? 10),
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
    ssl: useSsl ? { rejectUnauthorized: false } : undefined,
  });
}

const globalForDb = globalThis as unknown as {
  pgPool?: Pool;
  db?: Database;
};

function getPool(): Pool {
  if (!globalForDb.pgPool) {
    globalForDb.pgPool = createPool();
  }

  return globalForDb.pgPool;
}

function getDb(): Database {
  if (!globalForDb.db) {
    globalForDb.db = drizzle(getPool(), { schema });
  }

  return globalForDb.db;
}

/** Lazy DB handle — avoids connecting during Next.js production build. */
export const db = new Proxy({} as Database, {
  get(_target, prop, receiver) {
    const value = Reflect.get(getDb(), prop, receiver);
    if (typeof value === "function") {
      return (value as (...args: unknown[]) => unknown).bind(getDb());
    }
    return value;
  },
});
