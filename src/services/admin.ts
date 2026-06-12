import {
  and,
  count,
  desc,
  eq,
  ilike,
  isNotNull,
  isNull,
  or,
  sql,
} from "drizzle-orm";

import { withBypassRls } from "@/db/context";
import { cars, favorites, users } from "@/db/schema";
import { revalidateCarsCache } from "@/lib/cache/cars";
import { attachCoverImages } from "@/lib/db/attach-cover-images";
import { toIlikeContainsPattern } from "@/lib/db/escape-ilike";
import type { AdminStats, CarWithImages, CarWithSeller, User } from "@/types";

export type AdminCarListItem = CarWithImages & {
  user: Pick<User, "id" | "username" | "firstName" | "lastName" | "telegramId">;
};

export type AdminUserListItem = User & {
  listingCount: number;
};

export async function getAdminStats(): Promise<AdminStats> {
  return withBypassRls(async (tx) => {
    const [usersCount, carsCount, activeCars, featuredCars, bannedUsers, favoritesCount] =
      await Promise.all([
        tx
          .select({ value: count() })
          .from(users)
          .where(isNull(users.deletedAt)),
        tx.select({ value: count() }).from(cars).where(isNull(cars.deletedAt)),
        tx
          .select({ value: count() })
          .from(cars)
          .where(and(eq(cars.isActive, true), isNull(cars.deletedAt))),
        tx
          .select({ value: count() })
          .from(cars)
          .where(
            and(
              eq(cars.isFeatured, true),
              eq(cars.isActive, true),
              isNull(cars.deletedAt),
            ),
          ),
        tx
          .select({ value: count() })
          .from(users)
          .where(and(isNotNull(users.bannedAt), isNull(users.deletedAt))),
        tx.select({ value: count() }).from(favorites),
      ]);

    return {
      totalUsers: usersCount[0]?.value ?? 0,
      totalCars: carsCount[0]?.value ?? 0,
      activeCars: activeCars[0]?.value ?? 0,
      featuredCars: featuredCars[0]?.value ?? 0,
      bannedUsers: bannedUsers[0]?.value ?? 0,
      totalFavorites: favoritesCount[0]?.value ?? 0,
    };
  });
}

export async function listAdminCars(
  page = 1,
  limit = 20,
  search?: string,
): Promise<{ cars: AdminCarListItem[]; total: number }> {
  return withBypassRls(async (tx) => {
    const conditions = [isNull(cars.deletedAt)];

    if (search) {
      const pattern = toIlikeContainsPattern(search);
      conditions.push(
        or(
          ilike(cars.title, pattern),
          ilike(cars.brand, pattern),
          ilike(cars.model, pattern),
        )!,
      );
    }

    const where = and(...conditions);
    const offset = (page - 1) * limit;

    const [totalResult, rows] = await Promise.all([
      tx.select({ value: count() }).from(cars).where(where),
      tx.query.cars.findMany({
        where,
        with: {
          user: {
            columns: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              telegramId: true,
            },
          },
        },
        orderBy: [desc(cars.createdAt)],
        limit,
        offset,
      }),
    ]);

    const carRows = rows.map((row) => ({
      ...row,
      user: row.user,
    }));

    const carsWithImages = await attachCoverImages(tx, carRows);

    return {
      cars: carsWithImages as AdminCarListItem[],
      total: totalResult[0]?.value ?? 0,
    };
  });
}

export async function adminGetCar(carId: string): Promise<CarWithSeller | null> {
  return withBypassRls(async (tx) => {
    const car = await tx.query.cars.findFirst({
      where: (table, { and, eq, isNull }) =>
        and(eq(table.id, carId), isNull(table.deletedAt)),
      with: {
        carImages: true,
        user: {
          columns: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            photoUrl: true,
          },
        },
      },
    });

    return (car as CarWithSeller | undefined) ?? null;
  });
}

type AdminUpdateCarInput = {
  title?: string;
  brand?: string;
  model?: string;
  year?: number;
  price?: number;
  mileage?: number;
  fuel_type?: "gasoline" | "diesel" | "electric" | "hybrid" | "lpg";
  transmission?: "automatic" | "manual";
  description?: string | null;
  location?: string | null;
  isActive?: boolean;
  isFeatured?: boolean;
};

export async function adminUpdateCar(
  carId: string,
  input: AdminUpdateCarInput,
): Promise<CarWithSeller> {
  return withBypassRls(async (tx) => {
    const updates: Record<string, unknown> = { updatedAt: new Date() };

    if (input.title !== undefined) updates.title = input.title;
    if (input.brand !== undefined) updates.brand = input.brand;
    if (input.model !== undefined) updates.model = input.model;
    if (input.year !== undefined) updates.year = input.year;
    if (input.price !== undefined) updates.price = input.price;
    if (input.mileage !== undefined) updates.mileage = input.mileage;
    if (input.fuel_type !== undefined) updates.fuelType = input.fuel_type;
    if (input.transmission !== undefined) updates.transmission = input.transmission;
    if (input.description !== undefined) updates.description = input.description;
    if (input.location !== undefined) updates.location = input.location;
    if (input.isActive !== undefined) updates.isActive = input.isActive;
    if (input.isFeatured !== undefined) updates.isFeatured = input.isFeatured;

    const [updated] = await tx
      .update(cars)
      .set(updates)
      .where(and(eq(cars.id, carId), isNull(cars.deletedAt)))
      .returning();

    if (!updated) {
      throw new Error("Car not found");
    }

    const car = await adminGetCar(carId);
    if (!car) {
      throw new Error("Failed to fetch updated car");
    }

    revalidateCarsCache();

    return car;
  });
}

export async function adminDeleteCar(carId: string): Promise<void> {
  await withBypassRls(async (tx) => {
    await tx
      .update(cars)
      .set({
        deletedAt: new Date(),
        isActive: false,
        isFeatured: false,
        updatedAt: new Date(),
      })
      .where(and(eq(cars.id, carId), isNull(cars.deletedAt)));
  });

  revalidateCarsCache();
}

export async function adminSetCarFeatured(
  carId: string,
  isFeatured: boolean,
): Promise<void> {
  await withBypassRls(async (tx) => {
    await tx
      .update(cars)
      .set({ isFeatured, updatedAt: new Date() })
      .where(and(eq(cars.id, carId), isNull(cars.deletedAt)));
  });

  revalidateCarsCache();
}

export async function listAdminUsers(
  page = 1,
  limit = 20,
  search?: string,
): Promise<{ users: AdminUserListItem[]; total: number }> {
  return withBypassRls(async (tx) => {
    const conditions = [isNull(users.deletedAt)];

    if (search) {
      const pattern = toIlikeContainsPattern(search);
      conditions.push(
        or(
          ilike(users.username, pattern),
          ilike(users.firstName, pattern),
          ilike(users.lastName, pattern),
          sql`${users.telegramId}::text LIKE ${pattern} ESCAPE '\\'`,
        )!,
      );
    }

    const where = and(...conditions);
    const offset = (page - 1) * limit;

    const [totalResult, userRows] = await Promise.all([
      tx.select({ value: count() }).from(users).where(where),
      tx
        .select()
        .from(users)
        .where(where)
        .orderBy(desc(users.createdAt))
        .limit(limit)
        .offset(offset),
    ]);

    const listingCounts = await tx
      .select({
        userId: cars.userId,
        value: count(),
      })
      .from(cars)
      .where(isNull(cars.deletedAt))
      .groupBy(cars.userId);

    const countMap = new Map(
      listingCounts.map((row) => [row.userId, row.value]),
    );

    const usersWithCounts: AdminUserListItem[] = userRows.map((user) => ({
      ...user,
      listingCount: countMap.get(user.id) ?? 0,
    }));

    return {
      users: usersWithCounts,
      total: totalResult[0]?.value ?? 0,
    };
  });
}

export async function adminSetUserBanned(
  userId: string,
  banned: boolean,
): Promise<User> {
  return withBypassRls(async (tx) => {
    const [user] = await tx
      .update(users)
      .set({
        bannedAt: banned ? new Date() : null,
        updatedAt: new Date(),
      })
      .where(and(eq(users.id, userId), isNull(users.deletedAt)))
      .returning();

    if (!user) {
      throw new Error("User not found");
    }

    if (banned) {
      await tx
        .update(cars)
        .set({
          isActive: false,
          isFeatured: false,
          updatedAt: new Date(),
        })
        .where(and(eq(cars.userId, userId), isNull(cars.deletedAt)));
    }

    return user;
  });
}
