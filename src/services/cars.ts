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
} from "drizzle-orm";
import type { z } from "zod";

import { db } from "@/db";
import { carImages, cars } from "@/db/schema";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";
import type { createCarSchema } from "@/schemas/car";
import type { CarFilters, CarWithImages, CarWithSeller } from "@/types";

type CreateCarInput = z.infer<typeof createCarSchema>;

function buildCarFilterConditions(filters: CarFilters) {
  const conditions = [eq(cars.isActive, true), isNull(cars.deletedAt)];

  if (filters.search) {
    const pattern = `%${filters.search}%`;
    conditions.push(
      or(
        ilike(cars.title, pattern),
        ilike(cars.brand, pattern),
        ilike(cars.model, pattern),
      )!,
    );
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
  const where = buildCarFilterConditions(filters);

  const [totalResult, carsData] = await Promise.all([
    db.select({ value: count() }).from(cars).where(where),
    db.query.cars.findMany({
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
}

export async function getCarById(carId: string): Promise<CarWithSeller | null> {
  const car = await db.query.cars.findFirst({
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
}

export async function createCar(
  userId: string,
  input: CreateCarInput,
): Promise<CarWithSeller> {
  const { imageUrls, ...carData } = input;

  const [car] = await db
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

  await db.insert(carImages).values(
    imageUrls.map((url, index) => ({
      carId: car.id,
      url,
      sortOrder: index,
    })),
  );

  const result = await getCarById(car.id);

  if (!result) {
    throw new Error("Failed to fetch created car");
  }

  return result;
}

export async function softDeleteCar(
  carId: string,
  userId: string,
): Promise<void> {
  await db
    .update(cars)
    .set({
      deletedAt: new Date(),
      isActive: false,
      updatedAt: new Date(),
    })
    .where(and(eq(cars.id, carId), eq(cars.userId, userId)));
}

export async function getUserCars(userId: string): Promise<CarWithImages[]> {
  const result = await db.query.cars.findMany({
    where: (table, { and, eq, isNull }) =>
      and(eq(table.userId, userId), isNull(table.deletedAt)),
    with: { carImages: true },
    orderBy: [desc(cars.createdAt)],
  });

  return result as CarWithImages[];
}
