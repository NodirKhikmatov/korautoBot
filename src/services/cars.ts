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
import type { z } from "zod";

import type { DbTransaction } from "@/db/context";
import { withBypassRls } from "@/db/context";
import { carImages, cars } from "@/db/schema";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";
import type { createCarSchema } from "@/schemas/car";
import type {
  CarFilterOptions,
  CarFilters,
  CarImage,
  CarWithImages,
  CarWithSeller,
  CarsListResult,
} from "@/types";
import { validateUserImagePair } from "@/services/image-upload";

type CreateCarInput = z.infer<typeof createCarSchema>;

type CoverImageRow = {
  id: string;
  car_id: string;
  url: string;
  thumbnail_url: string;
  sort_order: number;
  created_at: string;
};

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

  if (filters.model) {
    conditions.push(ilike(cars.model, `%${filters.model}%`));
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

async function attachCoverImages(
  tx: DbTransaction,
  carList: Array<{ id: string } & Record<string, unknown>>,
): Promise<CarWithImages[]> {
  if (carList.length === 0) {
    return [];
  }

  const carIds = carList.map((car) => car.id);
  const result = await tx.execute(sql`
    SELECT DISTINCT ON (car_id)
      id,
      car_id,
      url,
      thumbnail_url,
      sort_order,
      created_at
    FROM car_images
    WHERE car_id IN (${sql.join(carIds.map((id) => sql`${id}`), sql`, `)})
    ORDER BY car_id, sort_order ASC
  `);

  const rows = (
    Array.isArray(result) ? result : (result.rows ?? [])
  ) as CoverImageRow[];
  const imageMap = new Map<string, CarImage[]>();

  for (const row of rows) {
    const image: CarImage = {
      id: row.id,
      carId: row.car_id,
      url: row.url,
      thumbnailUrl: row.thumbnail_url,
      sortOrder: row.sort_order,
      createdAt: new Date(row.created_at),
    };
    imageMap.set(row.car_id, [image]);
  }

  return carList.map((car) => ({
    ...(car as CarWithImages),
    carImages: imageMap.get(car.id) ?? [],
  }));
}

export async function getCars(
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
        .orderBy(desc(cars.createdAt))
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

export async function getCarFilterOptions(
  brand?: string,
): Promise<CarFilterOptions> {
  return withBypassRls(async (tx) => {
    const baseWhere = and(eq(cars.isActive, true), isNull(cars.deletedAt));

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
    const result = await tx
      .select()
      .from(cars)
      .where(and(eq(cars.userId, userId), isNull(cars.deletedAt)))
      .orderBy(desc(cars.createdAt));

    return attachCoverImages(tx, result);
  });
}
