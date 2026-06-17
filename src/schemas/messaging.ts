import { z } from "zod";

export const contactSellerSchema = z.object({
  message: z
    .string()
    .trim()
    .max(2000, "Message is too long")
    .optional(),
});

export type ContactSellerInput = z.infer<typeof contactSellerSchema>;
