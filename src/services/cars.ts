import {
  and,
  asc,
  count,
  desc,
  eq,
  gte,
  ilike,
  isNotNull,
  isNull,
  lte,
  or,
  sql,
} from "drizzle-orm";
import { unstable_cache } from "next/cache";
import type { z } from "zod";

import { withBypassRls } from "@/db/context";
import { carImages, cars } from "@/db/schema";
import { revalidateCarsCache } from "@/lib/cache/cars";
import { attachCoverImages } from "@/lib/db/attach-cover-images";
import { toIlikeContainsPattern } from "@/lib/db/escape-ilike";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";
import type { createCarSchema } from "@/schemas/car";
import type {
  CarFilterOptions,
  CarFilters,
  CarWithImages,
  CarWithSeller,
  CarsListResult,
} from "@/types";
import { validateUserImagePair } from "@/services/image-upload";
import { publicListingWhere } from "@/lib/listing/queries";

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
  const conditions = [publicListingWhere()];

  if (filters.search) {
    const pattern = toIlikeContainsPattern(filters.search);
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

  if (filters.model) {
    conditions.push(ilike(cars.model, toIlikeContainsPattern(filters.model)));
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

  if (filters.minMileage !== undefined) {
    conditions.push(gte(cars.mileage, filters.minMileage));
  }

  if (filters.maxMileage !== undefined) {
    conditions.push(lte(cars.mileage, filters.maxMileage));
  }

  if (filters.fuelType) {
    conditions.push(eq(cars.fuelType, filters.fuelType));
  }

  if (filters.transmission) {
    conditions.push(eq(cars.transmission, filters.transmission));
  }

  if (filters.region) {
    conditions.push(ilike(cars.location, `%${filters.region}%`));
  }

  return and(...conditions);
}

const CARS_LIST_CACHE_SECONDS = 60;

async function getCarsFromDb(
  filters: CarFilters = {},
  page = 1,
  limit = DEFAULT_PAGE_SIZE,
): Promise<CarsListResult> {
  return withBypassRls(async (tx) => {
    const where = buildCarFilterConditions(filters);
    const offset = (page - 1) * limit;

    const [totalResult, carsData] = await Promise.all([
      tx.select({ value: count() }).from(cars).where(where),
      tx
        .select()
        .from(cars)
        .where(where)
        .orderBy(desc(cars.isActive), desc(cars.isFeatured), desc(cars.createdAt))
        .limit(limit)
        .offset(offset),
    ]);

    const total = totalResult[0]?.value ?? 0;
    const carsWithImages = await attachCoverImages(tx, carsData);

    return {
      cars: carsWithImages,
      total,
      page,
      limit,
      hasMore: page * limit < total,
    };
  });
}

export async function getCars(
  filters: CarFilters = {},
  page = 1,
  limit = DEFAULT_PAGE_SIZE,
): Promise<CarsListResult> {
  const cacheKey = JSON.stringify({ filters, page, limit });

  return unstable_cache(
    () => getCarsFromDb(filters, page, limit),
    ["cars-list", cacheKey],
    { revalidate: CARS_LIST_CACHE_SECONDS, tags: ["cars"] },
  )();
}

async function getFeaturedCarsFromDb(limit = 6): Promise<CarWithImages[]> {
  return withBypassRls(async (tx) => {
    const carsData = await tx
      .select()
      .from(cars)
      .where(
        and(
          eq(cars.isActive, true),
          isNull(cars.deletedAt),
          eq(cars.isFeatured, true),
        ),
      )
      .orderBy(desc(cars.createdAt))
      .limit(limit);

    return attachCoverImages(tx, carsData);
  });
}

export async function getFeaturedCars(
  limit = 6,
): Promise<CarWithImages[]> {
  return unstable_cache(
    () => getFeaturedCarsFromDb(limit),
    ["cars-featured", String(limit)],
    { revalidate: CARS_LIST_CACHE_SECONDS, tags: ["cars"] },
  )();
}

export async function getCarFilterOptions(
  brand?: string,
): Promise<CarFilterOptions> {
  return withBypassRls(async (tx) => {
    const baseWhere = publicListingWhere();

    const brandRows = await tx
      .selectDistinct({ value: cars.brand })
      .from(cars)
      .where(baseWhere)
      .orderBy(asc(cars.brand));

    const modelWhere = brand
      ? and(baseWhere, eq(cars.brand, brand))
      : baseWhere;

    const modelRows = await tx
      .selectDistinct({ value: cars.model })
      .from(cars)
      .where(modelWhere)
      .orderBy(asc(cars.model));

    const regionRows = await tx
      .selectDistinct({ value: cars.location })
      .from(cars)
      .where(and(baseWhere, isNotNull(cars.location)))
      .orderBy(asc(cars.location));

    return {
      brands: brandRows.map((row) => row.value),
      models: modelRows.map((row) => row.value),
      regions: regionRows
        .map((row) => row.value)
        .filter((value): value is string => Boolean(value)),
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
            phone: true,
          },
        },
      },
    });

    return (car as CarWithSeller | undefined) ?? null;
  });
}

export type CarForContact = {
  id: string;
  userId: string;
  title: string;
  isActive: boolean;
  seller: {
    id: string;
    telegramId: number;
    username: string | null;
    firstName: string | null;
    lastName: string | null;
    phone: string | null;
  };
};

export async function getCarForContact(carId: string): Promise<CarForContact | null> {
  return withBypassRls(async (tx) => {
    const car = await tx.query.cars.findFirst({
      where: (table, { and, eq, isNull }) =>
        and(eq(table.id, carId), isNull(table.deletedAt)),
      columns: {
        id: true,
        userId: true,
        title: true,
        isActive: true,
      },
      with: {
        user: {
          columns: {
            id: true,
            telegramId: true,
            username: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
      },
    });

    if (!car) {
      return null;
    }

    return {
      id: car.id,
      userId: car.userId,
      title: car.title,
      isActive: car.isActive,
      seller: car.user,
    };
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
            phone: true,
          },
        },
      },
    });

    if (!result) {
      throw new Error("Failed to fetch created car");
    }

    revalidateCarsCache();

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

  revalidateCarsCache();
}

export async function getUserCars(userId: string): Promise<CarWithImages[]> {
  return withBypassRls(async (tx) => {
    const result = await tx
      .select()
      .from(cars)
      .where(and(eq(cars.userId, userId), isNull(cars.deletedAt)))
      .orderBy(desc(cars.createdAt));

    return attachCoverImages(tx, result);
  });
}
