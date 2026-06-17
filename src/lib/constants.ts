export const APP_NAME = "Korea Auto Market";

export const DEFAULT_PAGE_SIZE = 20;

export const MAX_IMAGES_PER_LISTING = 12;

export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export type AllowedImageType = typeof ALLOWED_IMAGE_TYPES[number];

export const CAR_BRANDS = [
  "Hyundai",
  "Kia",
  "Genesis",
  "Toyota",
  "Honda",
  "BMW",
  "Mercedes-Benz",
  "Audi",
  "Volkswagen",
  "Other",
] as const;

export const FUEL_TYPES = [
  "gasoline",
  "diesel",
  "electric",
  "hybrid",
  "lpg",
] as const;

export const TRANSMISSION_TYPES = ["automatic", "manual"] as const;
