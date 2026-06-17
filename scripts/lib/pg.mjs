import { config } from "dotenv";
import pg from "pg";

import {
  normalizePgConnectionString,
  pgConnectionStringUsesSsl,
} from "./normalize-connection-string.mjs";

config({ path: ".env.local" });
config({ path: ".env" });

const { Client } = pg;

export function getConnectionString() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  return normalizePgConnectionString(connectionString);
}

export function createPgClient() {
  const connectionString = getConnectionString();
  const useSsl =
    process.env.DATABASE_SSL === "true" ||
    pgConnectionStringUsesSsl(connectionString);

  return new Client({
    connectionString,
    ssl: useSsl ? { rejectUnauthorized: false } : undefined,
  });
}

export async function withPgClient(fn) {
  const client = createPgClient();
  await client.connect();

  try {
    return await fn(client);
  } finally {
    await client.end();
  }
}
