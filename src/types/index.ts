import type { InferSelectModel } from "drizzle-orm";

import type { carImages, cars, conversations, favorites, messages, users } from "@/db/schema";

export type User = InferSelectModel<typeof users>;
export type Car = InferSelectModel<typeof cars>;
export type CarImage = InferSelectModel<typeof carImages>;
export type Favorite = InferSelectModel<typeof favorites>;
export type Conversation = InferSelectModel<typeof conversations>;
export type Message = InferSelectModel<typeof messages>;

export type FuelType = Car["fuelType"];
export type TransmissionType = Car["transmission"];

export type CarWithImages = Car & {
  carImages: CarImage[];
};

export type SellerProfile = Pick<
  User,
  "id" | "username" | "firstName" | "lastName" | "photoUrl" | "phone"
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

export type AdminStats = {
  totalUsers: number;
  totalCars: number;
  activeCars: number;
  featuredCars: number;
  bannedUsers: number;
  totalFavorites: number;
};
