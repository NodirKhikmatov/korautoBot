import { and, eq, isNotNull, isNull, or } from "drizzle-orm";

import { cars } from "@/db/schema";

/** Active listings and sold listings visible on the public marketplace. */
export function publicListingWhere() {
  return and(
    isNull(cars.deletedAt),
    or(eq(cars.isActive, true), isNotNull(cars.soldAt)),
  );
}
