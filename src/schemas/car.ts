import { z } from "zod";

import {
  FUEL_TYPES,
  MAX_IMAGES_PER_LISTING,
  TRANSMISSION_TYPES,
} from "@/lib/constants";

export const carImageInputSchema = z.object({
  url: z.string().url(),
  thumbnailUrl: z.string().url(),
});

export const createCarSchema = z.object({
  title: z.string().min(3).max(100),
  brand: z.string().min(1).max(50),
  model: z.string().min(1).max(50),
  year: z.number().int().min(1990).max(new Date().getFullYear() + 1),
  price: z.number().int().positive(),
  mileage: z.number().int().min(0),
  fuel_type: z.enum(FUEL_TYPES),
  transmission: z.enum(TRANSMISSION_TYPES),
  description: z.string().max(2000).optional(),
  location: z.string().max(100).optional(),
  images: z.array(carImageInputSchema).min(1).max(MAX_IMAGES_PER_LISTING),
});

export const updateCarSchema = createCarSchema.partial();

export const carFiltersSchema = z.object({
  search: z.string().optional(),
  brand: z.string().optional(),
  minPrice: z.coerce.number().int().positive().optional(),
  maxPrice: z.coerce.number().int().positive().optional(),
  minYear: z.coerce.number().int().optional(),
  maxYear: z.coerce.number().int().optional(),
  fuelType: z.enum(FUEL_TYPES).optional(),
  transmission: z.enum(TRANSMISSION_TYPES).optional(),
  location: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(20),
});
