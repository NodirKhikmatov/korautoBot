import { z } from "zod";

import { isValidPhone, normalizePhone } from "@/lib/contact/phone";

export const telegramAuthSchema = z.object({
  initData: z.string().min(1, "initData is required"),
});

export const telegramUserSchema = z.object({
  id: z.number().int().positive(),
  first_name: z.string(),
  last_name: z.string().optional(),
  username: z.string().optional(),
  photo_url: z.string().url().optional(),
  language_code: z.string().optional(),
  is_premium: z.boolean().optional(),
});

export const userProfileSchema = z.object({
  telegramId: z.number().int().positive(),
  username: z.string().nullable(),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  photoUrl: z.string().nullable(),
  phone: z.string().nullable(),
});

export const updateProfileSchema = z.object({
  phone: z
    .string()
    .max(32)
    .transform((value) => {
      const trimmed = value.trim();
      return trimmed.length === 0 ? null : normalizePhone(trimmed);
    })
    .refine(
      (value) => value === null || isValidPhone(value),
      "Invalid phone number",
    ),
});

export const optionalPhoneFieldSchema = z
  .string()
  .max(32)
  .optional()
  .transform((value) => {
    if (value === undefined) {
      return undefined;
    }

    const trimmed = value.trim();
    return trimmed.length === 0 ? null : normalizePhone(trimmed);
  })
  .refine(
    (value) => value === undefined || value === null || isValidPhone(value),
    "Invalid phone number",
  );
