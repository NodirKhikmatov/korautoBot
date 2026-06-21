import {
  getAccidentFactor,
  getAgeFactor,
  getBaseMonthlyPremium,
  getComprehensiveFactor,
  getExperienceFactor,
  getRegionFactor,
  getVehicleAgeFactor,
} from "@/lib/insurance/factors";
import type { InsuranceInput, InsuranceResult } from "@/lib/insurance/types";

const ESTIMATE_VARIANCE = 0.15;

export function calculateInsurancePremium(input: InsuranceInput): InsuranceResult {
  const basePremium = getBaseMonthlyPremium(input.vehiclePrice, input.mileage);
  const ageFactor = getAgeFactor(input.driverAge);
  const experienceFactor = getExperienceFactor(input.yearsLicensed);
  const comprehensiveFactor = getComprehensiveFactor(input.hasOwnDamage);
  const accidentFactor = getAccidentFactor(input.accidentHistory);
  const regionFactor = getRegionFactor(input.region);
  const vehicleAgeFactor = getVehicleAgeFactor(input.year);

  const monthlyEstimate = Math.round(
    basePremium *
      ageFactor *
      experienceFactor *
      comprehensiveFactor *
      accidentFactor *
      regionFactor *
      vehicleAgeFactor,
  );

  const monthlyLow = Math.round(monthlyEstimate * (1 - ESTIMATE_VARIANCE));
  const monthlyHigh = Math.round(monthlyEstimate * (1 + ESTIMATE_VARIANCE));

  return {
    monthlyEstimate,
    monthlyLow,
    monthlyHigh,
    yearlyLow: monthlyLow * 12,
    yearlyHigh: monthlyHigh * 12,
    breakdown: {
      basePremium,
      ageFactor,
      experienceFactor,
      comprehensiveFactor,
      accidentFactor,
      regionFactor,
      vehicleAgeFactor,
    },
  };
}
