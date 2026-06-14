import { z } from "zod";

export const supportMessageSchema = z.object({
  message: z
    .string()
    .trim()
    .min(1, "Message is required")
    .max(2000, "Message is too long"),
});

export type SupportMessageInput = z.infer<typeof supportMessageSchema>;
