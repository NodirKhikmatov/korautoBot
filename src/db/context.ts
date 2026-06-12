import { sql } from "drizzle-orm";
import type { ExtractTablesWithRelations } from "drizzle-orm";
import type { PgTransaction } from "drizzle-orm/pg-core";
import type { NeonQueryResultHKT } from "drizzle-orm/neon-serverless";

import { db } from "./index";
import type * as schema from "./schema";

export type DbTransaction = PgTransaction<
  NeonQueryResultHKT,
  typeof schema,
  ExtractTablesWithRelations<typeof schema>
>;

type DbContextOptions = {
  bypass?: boolean;
  userId?: string;
};

/**
 * Runs queries inside a transaction with RLS session context.
 * Server API routes should use bypass=true (auth enforced at route layer).
 * User-scoped operations can pass userId instead.
 */
export async function withDbContext<T>(
  options: DbContextOptions,
  fn: (tx: DbTransaction) => Promise<T>,
): Promise<T> {
  return db.transaction(async (tx) => {
    if (options.bypass) {
      await tx.execute(sql`SELECT set_config('app.bypass_rls', 'true', true)`);
    }

    if (options.userId) {
      await tx.execute(
        sql`SELECT set_config('app.user_id', ${options.userId}, true)`,
      );
    }

    return fn(tx);
  });
}

export async function withBypassRls<T>(
  fn: (tx: DbTransaction) => Promise<T>,
): Promise<T> {
  return withDbContext({ bypass: true }, fn);
}

export async function withUserRls<T>(
  userId: string,
  fn: (tx: DbTransaction) => Promise<T>,
): Promise<T> {
  return withDbContext({ userId }, fn);
}
