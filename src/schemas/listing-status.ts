import { z } from "zod";

export const listingStatusSchema = z.object({
  status: z.enum(["active", "sold"]),
});

export type ListingStatusInput = z.infer<typeof listingStatusSchema>;
