import { z } from "zod";

import { createCarSchema } from "@/schemas/car";
import { FUEL_TYPES, TRANSMISSION_TYPES } from "@/lib/constants";
import { normalizeTelegramUsername } from "@/lib/telegram/contact";

export const adminListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(20),
  search: z.string().max(100).optional(),
});

const optionalSellerUsername = z
  .string()
  .max(32)
  .optional()
  .nullable()
  .transform((value) => {
    if (!value?.trim()) return null;
    return normalizeTelegramUsername(value);
  });

export const adminUpdateCarSchema = z.object({
  title: z.string().min(3).max(100).optional(),
  brand: z.string().min(1).max(50).optional(),
  model: z.string().min(1).max(50).optional(),
  year: z.number().int().min(1990).max(new Date().getFullYear() + 1).optional(),
  price: z.number().int().positive().optional(),
  mileage: z.number().int().min(0).optional(),
  fuel_type: z.enum(FUEL_TYPES).optional(),
  transmission: z.enum(TRANSMISSION_TYPES).optional(),
  description: z.string().max(2000).optional().nullable(),
  location: z.string().max(100).optional().nullable(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  seller_display_name: z.string().max(100).optional().nullable(),
  seller_username: optionalSellerUsername,
  seller_telegram_id: z.number().int().positive().optional().nullable(),
  seller_phone: z.string().max(20).optional().nullable(),
});

export const adminFeatureCarSchema = z.object({
  isFeatured: z.boolean(),
});

export const adminBanUserSchema = z.object({
  banned: z.boolean(),
});

export const adminCreateCarSchema = createCarSchema
  .extend({
    isActive: z.boolean().optional(),
    isFeatured: z.boolean().optional(),
    seller_display_name: z.string().max(100).optional().nullable(),
    seller_username: optionalSellerUsername,
    seller_telegram_id: z.number().int().positive().optional().nullable(),
    seller_phone: z.string().max(20).optional().nullable(),
  })
  .refine(
    (data) =>
      Boolean(
        data.seller_username ||
          data.seller_telegram_id ||
          data.seller_phone?.trim(),
      ),
    { message: "Provide seller Telegram username, Telegram ID, or phone" },
  );

export type AdminCreateCarInput = z.infer<typeof adminCreateCarSchema>;

export const adminBroadcastSchema = z.object({
  message: z
    .string()
    .trim()
    .min(1, "Message is required")
    .max(4000, "Message is too long"),
});
