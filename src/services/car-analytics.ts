import { eq, sql } from "drizzle-orm";

import { withBypassRls } from "@/db/context";
import { carContacts, carViews, cars } from "@/db/schema";

type AnalyticsResult = {
  recorded: boolean;
  viewCount: number;
  contactCount: number;
};

export async function recordCarView(
  carId: string,
  viewerKey: string,
): Promise<AnalyticsResult> {
  return withBypassRls(async (tx) => {
    const inserted = await tx
      .insert(carViews)
      .values({ carId, viewerKey })
      .onConflictDoNothing({
        target: [carViews.carId, carViews.viewerKey],
      })
      .returning({ id: carViews.id });

    if (inserted.length > 0) {
      await tx
        .update(cars)
        .set({ viewCount: sql`${cars.viewCount} + 1` })
        .where(eq(cars.id, carId));
    }

    const [car] = await tx
      .select({
        viewCount: cars.viewCount,
        contactCount: cars.contactCount,
      })
      .from(cars)
      .where(eq(cars.id, carId));

    return {
      recorded: inserted.length > 0,
      viewCount: car?.viewCount ?? 0,
      contactCount: car?.contactCount ?? 0,
    };
  });
}

export async function recordCarContact(
  carId: string,
  userId: string,
): Promise<AnalyticsResult> {
  return withBypassRls(async (tx) => {
    const inserted = await tx
      .insert(carContacts)
      .values({ carId, userId })
      .onConflictDoNothing({
        target: [carContacts.carId, carContacts.userId],
      })
      .returning({ id: carContacts.id });

    if (inserted.length > 0) {
      await tx
        .update(cars)
        .set({ contactCount: sql`${cars.contactCount} + 1` })
        .where(eq(cars.id, carId));
    }

    const [car] = await tx
      .select({
        viewCount: cars.viewCount,
        contactCount: cars.contactCount,
      })
      .from(cars)
      .where(eq(cars.id, carId));

    return {
      recorded: inserted.length > 0,
      viewCount: car?.viewCount ?? 0,
      contactCount: car?.contactCount ?? 0,
    };
  });
}
