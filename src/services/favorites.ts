import { and, desc, eq, inArray, isNull } from "drizzle-orm";

import { withBypassRls } from "@/db/context";
import { cars, favorites } from "@/db/schema";
import { attachCoverImages } from "@/lib/db/attach-cover-images";
import { FavoriteError } from "@/lib/favorites/errors";
import type { CarWithImages, Favorite } from "@/types";

export type UserFavoritesResult = {
  favorites: CarWithImages[];
  carIds: string[];
  total: number;
};

export async function addFavorite(userId: string, carId: string): Promise<void> {
  await withBypassRls(async (tx) => {
    const car = await tx.query.cars.findFirst({
      where: (table, { and, eq, isNull }) =>
        and(eq(table.id, carId), eq(table.isActive, true), isNull(table.deletedAt)),
      columns: { id: true },
    });

    if (!car) {
      throw new FavoriteError("Car not found or no longer available", 404);
    }

    await tx
      .insert(favorites)
      .values({ userId, carId })
      .onConflictDoNothing({
        target: [favorites.userId, favorites.carId],
      });
  });
}

export async function removeFavorite(
  userId: string,
  carId: string,
): Promise<void> {
  await withBypassRls(async (tx) => {
    const deleted = await tx
      .delete(favorites)
      .where(and(eq(favorites.userId, userId), eq(favorites.carId, carId)))
      .returning({ id: favorites.id });

    if (deleted.length === 0) {
      throw new FavoriteError("Favorite not found", 404);
    }
  });
}

export async function getUserFavorites(
  userId: string,
): Promise<UserFavoritesResult> {
  return withBypassRls(async (tx) => {
    const rows = await tx.query.favorites.findMany({
      where: eq(favorites.userId, userId),
      with: {
        car: true,
      },
      orderBy: [desc(favorites.createdAt)],
    });

    const activeCars = rows
      .map((row) => row.car)
      .filter(
        (car) => car.isActive && car.deletedAt === null,
      );

    const carsWithImages = await attachCoverImages(tx, activeCars);

    return {
      favorites: carsWithImages,
      carIds: carsWithImages.map((car) => car.id),
      total: carsWithImages.length,
    };
  });
}

export async function getUserFavoriteCarIds(userId: string): Promise<string[]> {
  return withBypassRls(async (tx) => {
    const rows = await tx
      .select({ carId: favorites.carId })
      .from(favorites)
      .innerJoin(cars, eq(favorites.carId, cars.id))
      .where(
        and(
          eq(favorites.userId, userId),
          eq(cars.isActive, true),
          isNull(cars.deletedAt),
        ),
      )
      .orderBy(desc(favorites.createdAt));

    return rows.map((row) => row.carId);
  });
}

export async function getFavoriteStatusForCars(
  userId: string,
  carIds: string[],
): Promise<Record<string, boolean>> {
  if (carIds.length === 0) {
    return {};
  }

  return withBypassRls(async (tx) => {
    const rows = await tx
      .select({ carId: favorites.carId })
      .from(favorites)
      .where(
        and(eq(favorites.userId, userId), inArray(favorites.carId, carIds)),
      );

    const favoriteSet = new Set(rows.map((row) => row.carId));
    const result: Record<string, boolean> = {};

    for (const carId of carIds) {
      result[carId] = favoriteSet.has(carId);
    }

    return result;
  });
}

export async function isFavorite(
  userId: string,
  carId: string,
): Promise<boolean> {
  return withBypassRls(async (tx) => {
    const favorite = await tx.query.favorites.findFirst({
      where: and(eq(favorites.userId, userId), eq(favorites.carId, carId)),
      columns: { id: true },
    });

    return favorite !== undefined;
  });
}

export async function getFavoriteRecord(
  userId: string,
  carId: string,
): Promise<Favorite | null> {
  return withBypassRls(async (tx) => {
    const favorite = await tx.query.favorites.findFirst({
      where: and(eq(favorites.userId, userId), eq(favorites.carId, carId)),
    });

    return favorite ?? null;
  });
}
