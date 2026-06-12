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

export type SellerProfile = Pick<
  User,
  "id" | "username" | "firstName" | "lastName" | "photoUrl"
>;

export type CarWithSeller = CarWithImages & {
  user: SellerProfile;
};

export type UploadedCarImage = {
  imageId: string;
  url: string;
  thumbnailUrl: string;
  key: string;
  thumbnailKey: string;
  width: number;
  height: number;
};

export type CarFilters = {
  search?: string;
  brand?: string;
  model?: string;
  minPrice?: number;
  maxPrice?: number;
  minYear?: number;
  maxYear?: number;
  minMileage?: number;
  maxMileage?: number;
  fuelType?: FuelType;
  transmission?: TransmissionType;
  region?: string;
};

export type CarsListResult = {
  cars: CarWithImages[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
};

export type CarFilterOptions = {
  brands: string[];
  models: string[];
  regions: string[];
};
