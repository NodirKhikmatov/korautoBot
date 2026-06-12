import { sql } from "drizzle-orm";

import type { DbTransaction } from "@/db/context";
import type { CarImage, CarWithImages } from "@/types";

type CoverImageRow = {
  id: string;
  car_id: string;
  url: string;
  thumbnail_url: string;
  sort_order: number;
  created_at: string;
};

export async function attachCoverImages(
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
