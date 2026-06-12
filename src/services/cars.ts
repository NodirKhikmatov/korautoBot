import {
  and,
  count,
  desc,
  eq,
  gte,
  ilike,
  isNull,
  lte,
  or,
  sql,
} from "drizzle-orm";
import type { z } from "zod";

import { withBypassRls } from "@/db/context";
import { carImages, cars } from "@/db/schema";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";
import type { createCarSchema } from "@/schemas/car";
import type { CarFilters, CarWithImages, CarWithSeller } from "@/types";
import { validateUserImagePair } from "@/services/image-upload";

type CreateCarInput = z.infer<typeof createCarSchema>;

function toTsQuery(search: string): string {
  return search
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.replace(/[^\w\u0400-\u04FF\uAC00-\uD7AF]/g, ""))
    .filter(Boolean)
    .join(" & ");
}

function buildCarFilterConditions(filters: CarFilters) {
  const conditions = [eq(cars.isActive, true), isNull(cars.deletedAt)];

  if (filters.search) {
    const pattern = `%${filters.search}%`;
    const tsQuery = toTsQuery(filters.search);

    if (tsQuery) {
      conditions.push(
        or(
          sql`${cars.searchVector} @@ to_tsquery('simple', ${tsQuery})`,
          ilike(cars.title, pattern),
          ilike(cars.brand, pattern),
          ilike(cars.model, pattern),
        )!,
      );
    } else {
      conditions.push(
        or(
          ilike(cars.title, pattern),
          ilike(cars.brand, pattern),
          ilike(cars.model, pattern),
        )!,
      );
    }
  }

  if (filters.brand) {
    conditions.push(eq(cars.brand, filters.brand));
  }

  if (filters.minPrice !== undefined) {
    conditions.push(gte(cars.price, filters.minPrice));
  }

  if (filters.maxPrice !== undefined) {
    conditions.push(lte(cars.price, filters.maxPrice));
  }

  if (filters.minYear !== undefined) {
    conditions.push(gte(cars.year, filters.minYear));
  }

  if (filters.maxYear !== undefined) {
    conditions.push(lte(cars.year, filters.maxYear));
  }

  if (filters.fuelType) {
    conditions.push(eq(cars.fuelType, filters.fuelType));
  }

  if (filters.transmission) {
    conditions.push(eq(cars.transmission, filters.transmission));
  }

  if (filters.location) {
    conditions.push(ilike(cars.location, `%${filters.location}%`));
  }

  return and(...conditions);
}

export async function getCars(
  filters: CarFilters = {},
  page = 1,
  limit = DEFAULT_PAGE_SIZE,
): Promise<{ cars: CarWithImages[]; total: number }> {
  return withBypassRls(async (tx) => {
    const where = buildCarFilterConditions(filters);

    const [totalResult, carsData] = await Promise.all([
      tx.select({ value: count() }).from(cars).where(where),
      tx.query.cars.findMany({
        where,
        with: { carImages: true },
        orderBy: [desc(cars.createdAt)],
        limit,
        offset: (page - 1) * limit,
      }),
    ]);

    return {
      cars: carsData as CarWithImages[],
      total: totalResult[0]?.value ?? 0,
    };
  });
}

export async function getCarById(carId: string): Promise<CarWithSeller | null> {
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

export async function createCar(
  userId: string,
  input: CreateCarInput,
): Promise<CarWithSeller> {
  return withBypassRls(async (tx) => {
    const { images, ...carData } = input;

    for (const image of images) {
      validateUserImagePair(userId, image.url, image.thumbnailUrl);
    }

    const [car] = await tx
      .insert(cars)
      .values({
        userId,
        title: carData.title,
        brand: carData.brand,
        model: carData.model,
        year: carData.year,
        price: carData.price,
        mileage: carData.mileage,
        fuelType: carData.fuel_type,
        transmission: carData.transmission,
        description: carData.description ?? null,
        location: carData.location ?? null,
        isActive: true,
      })
      .returning();

    if (!car) {
      throw new Error("Failed to create car");
    }

    await tx.insert(carImages).values(
      images.map((image, index) => ({
        carId: car.id,
        url: image.url,
        thumbnailUrl: image.thumbnailUrl,
        sortOrder: index,
      })),
    );

    const result = await tx.query.cars.findFirst({
      where: eq(cars.id, car.id),
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

    if (!result) {
      throw new Error("Failed to fetch created car");
    }

    return result as CarWithSeller;
  });
}

export async function softDeleteCar(
  carId: string,
  userId: string,
): Promise<void> {
  await withBypassRls(async (tx) => {
    await tx
      .update(cars)
      .set({
        deletedAt: new Date(),
        isActive: false,
        updatedAt: new Date(),
      })
      .where(and(eq(cars.id, carId), eq(cars.userId, userId)));
  });
}

export async function getUserCars(userId: string): Promise<CarWithImages[]> {
  return withBypassRls(async (tx) => {
    const result = await tx.query.cars.findMany({
      where: (table, { and, eq, isNull }) =>
        and(eq(table.userId, userId), isNull(table.deletedAt)),
      with: { carImages: true },
      orderBy: [desc(cars.createdAt)],
    });

    return result as CarWithImages[];
  });
}
