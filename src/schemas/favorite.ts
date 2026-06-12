import { z } from "zod";

export const favoriteCarSchema = z.object({
  carId: z.string().uuid(),
});

export const favoriteCheckSchema = z.object({
  carIds: z
    .string()
    .optional()
    .transform((value) => (value ? value.split(",").filter(Boolean) : []))
    .pipe(z.array(z.string().uuid()).max(100)),
});
