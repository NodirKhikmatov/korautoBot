import { z } from "zod";

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
});
