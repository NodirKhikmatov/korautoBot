import type { InferSelectModel } from "drizzle-orm";

import type { carImages, cars, favorites, users } from "@/db/schema";

export type User = InferSelectModel<typeof users>;
export type Car = InferSelectModel<typeof cars>;
export type CarImage = InferSelectModel<typeof carImages>;
export type Favorite = InferSelectModel<typeof favorites>;

export type FuelType = Car["fuelType"];
export type TransmissionType = Car["transmission"];

export type CarWithImages = Car & {
  carImages: CarImage[];
};

export type CarWithSeller = CarWithImages & {
  user: Pick<User, "id" | "username" | "firstName" | "lastName" | "photoUrl">;
};

export type CarFilters = {
  search?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  minYear?: number;
  maxYear?: number;
  fuelType?: FuelType;
  transmission?: TransmissionType;
  location?: string;
};
