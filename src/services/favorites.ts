import { and, desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { favorites } from "@/db/schema";
import type { CarWithImages } from "@/types";

export async function addFavorite(userId: string, carId: string): Promise<void> {
  await db.insert(favorites).values({ userId, carId });
}

export async function removeFavorite(
  userId: string,
  carId: string,
): Promise<void> {
  await db
    .delete(favorites)
    .where(and(eq(favorites.userId, userId), eq(favorites.carId, carId)));
}

export async function getUserFavorites(
  userId: string,
): Promise<CarWithImages[]> {
  const rows = await db.query.favorites.findMany({
    where: eq(favorites.userId, userId),
    with: {
      car: {
        with: { carImages: true },
      },
    },
    orderBy: [desc(favorites.createdAt)],
  });

  return rows.map((row) => row.car as CarWithImages);
}

export async function isFavorite(
  userId: string,
  carId: string,
): Promise<boolean> {
  const favorite = await db.query.favorites.findFirst({
    where: and(eq(favorites.userId, userId), eq(favorites.carId, carId)),
    columns: { id: true },
  });

  return favorite !== undefined;
}
