import { and, desc, eq } from "drizzle-orm";

import { withBypassRls } from "@/db/context";
import { favorites } from "@/db/schema";
import type { CarWithImages } from "@/types";

export async function addFavorite(userId: string, carId: string): Promise<void> {
  await withBypassRls(async (tx) => {
    await tx.insert(favorites).values({ userId, carId });
  });
}

export async function removeFavorite(
  userId: string,
  carId: string,
): Promise<void> {
  await withBypassRls(async (tx) => {
    await tx
      .delete(favorites)
      .where(and(eq(favorites.userId, userId), eq(favorites.carId, carId)));
  });
}

export async function getUserFavorites(
  userId: string,
): Promise<CarWithImages[]> {
  return withBypassRls(async (tx) => {
    const rows = await tx.query.favorites.findMany({
      where: eq(favorites.userId, userId),
      with: {
        car: {
          with: { carImages: true },
        },
      },
      orderBy: [desc(favorites.createdAt)],
    });

    return rows.map((row) => row.car as CarWithImages);
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
