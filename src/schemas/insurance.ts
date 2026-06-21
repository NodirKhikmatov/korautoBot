import { z } from "zod";

export const insuranceRegionSchema = z.enum(["seoul", "gyeonggi", "other"]);

export const accidentHistorySchema = z.enum(["none", "one", "multiple"]);

export const insuranceInputSchema = z.object({
  vehiclePrice: z.number().int().min(1_000_000).max(500_000_000),
  year: z.number().int().min(1990).max(new Date().getFullYear() + 1),
  mileage: z.number().int().min(0).max(1_000_000),
  driverAge: z.number().int().min(18).max(80),
  yearsLicensed: z.number().int().min(0).max(60),
  region: insuranceRegionSchema,
  hasOwnDamage: z.boolean(),
  accidentHistory: accidentHistorySchema,
});

export type InsuranceFormValues = z.infer<typeof insuranceInputSchema>;
