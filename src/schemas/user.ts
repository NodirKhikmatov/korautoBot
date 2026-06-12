import { z } from "zod";

export const telegramAuthSchema = z.object({
  initData: z.string().min(1, "initData is required"),
});

export const userProfileSchema = z.object({
  telegram_id: z.number().int().positive(),
  username: z.string().nullable(),
  first_name: z.string().nullable(),
  last_name: z.string().nullable(),
  photo_url: z.string().nullable(),
});
