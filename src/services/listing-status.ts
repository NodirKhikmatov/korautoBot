import { and, eq } from "drizzle-orm";

import { withBypassRls } from "@/db/context";
import { cars } from "@/db/schema";
import { revalidateCarsCache } from "@/lib/cache/cars";
import { ListingError } from "@/lib/listing/errors";
import { isListingSold } from "@/lib/listing/status";
import type { CarWithSeller } from "@/types";

async function getOwnedCar(
  carId: string,
  userId: string,
): Promise<typeof cars.$inferSelect | null> {
  return withBypassRls(async (tx) => {
    const car = await tx.query.cars.findFirst({
      where: (table, { and, eq, isNull }) =>
        and(eq(table.id, carId), eq(table.userId, userId), isNull(table.deletedAt)),
    });

    return car ?? null;
  });
}

export async function updateListingStatus(
  carId: string,
  userId: string,
  status: "active" | "sold",
): Promise<CarWithSeller> {
  const car = await getOwnedCar(carId, userId);

  if (!car) {
    throw new ListingError("Listing not found", 404, "LISTING_NOT_FOUND");
  }

  if (status === "sold") {
    if (car.soldAt) {
      throw new ListingError("Listing is already sold", 400, "ALREADY_SOLD");
    }

    return withBypassRls(async (tx) => {
      const [updated] = await tx
        .update(cars)
        .set({
          isActive: false,
          isFeatured: false,
          soldAt: new Date(),
          updatedAt: new Date(),
        })
        .where(and(eq(cars.id, carId), eq(cars.userId, userId)))
        .returning();

      if (!updated) {
        throw new ListingError("Listing not found", 404, "LISTING_NOT_FOUND");
      }

      const result = await tx.query.cars.findFirst({
        where: (table, { eq }) => eq(table.id, carId),
        with: {
          carImages: true,
          user: {
            columns: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              photoUrl: true,
              phone: true,
            },
          },
        },
      });

      if (!result) {
        throw new ListingError("Listing not found", 404, "LISTING_NOT_FOUND");
      }

      revalidateCarsCache();
      return result as CarWithSeller;
    });
  }

  if (!car.soldAt) {
    throw new ListingError("Listing is already active", 400, "ALREADY_ACTIVE");
  }

  return withBypassRls(async (tx) => {
    const [updated] = await tx
      .update(cars)
      .set({
        isActive: true,
        soldAt: null,
        updatedAt: new Date(),
      })
      .where(and(eq(cars.id, carId), eq(cars.userId, userId)))
      .returning();

    if (!updated) {
      throw new ListingError("Listing not found", 404, "LISTING_NOT_FOUND");
    }

    const result = await tx.query.cars.findFirst({
      where: (table, { eq }) => eq(table.id, carId),
      with: {
        carImages: true,
        user: {
          columns: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            photoUrl: true,
            phone: true,
          },
        },
      },
    });

    if (!result) {
      throw new ListingError("Listing not found", 404, "LISTING_NOT_FOUND");
    }

    revalidateCarsCache();
    return result as CarWithSeller;
  });
}

export { isListingSold } from "@/lib/listing/status";
