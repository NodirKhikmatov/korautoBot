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
    connectionString.includes("sslmode=require");

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
  if (globalForDb.pgPool) {
    return globalForDb.pgPool;
  }

  const pool = createPool();
  if (process.env.NODE_ENV !== "production") {
    globalForDb.pgPool = pool;
  }
  return pool;
}

function getDb(): Database {
  if (globalForDb.db) {
    return globalForDb.db;
  }

  const database = drizzle(getPool(), { schema });
  if (process.env.NODE_ENV !== "production") {
    globalForDb.db = database;
  }
  return database;
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
