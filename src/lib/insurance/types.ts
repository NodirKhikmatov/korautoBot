export type InsuranceRegion = "seoul" | "gyeonggi" | "other";

export type AccidentHistory = "none" | "one" | "multiple";

export type InsuranceInput = {
  vehiclePrice: number;
  year: number;
  mileage: number;
  driverAge: number;
  yearsLicensed: number;
  region: InsuranceRegion;
  hasOwnDamage: boolean;
  accidentHistory: AccidentHistory;
};

export type InsuranceBreakdown = {
  basePremium: number;
  ageFactor: number;
  experienceFactor: number;
  comprehensiveFactor: number;
  accidentFactor: number;
  regionFactor: number;
  vehicleAgeFactor: number;
};

export type InsuranceResult = {
  monthlyEstimate: number;
  monthlyLow: number;
  monthlyHigh: number;
  yearlyLow: number;
  yearlyHigh: number;
  breakdown: InsuranceBreakdown;
};
