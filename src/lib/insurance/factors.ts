import type { AccidentHistory, InsuranceRegion } from "@/lib/insurance/types";

const MIN_BASE_MONTHLY_KRW = 45_000;

export function getAgeFactor(driverAge: number): number {
  if (driverAge < 22) return 2.0;
  if (driverAge < 26) return 1.75;
  if (driverAge < 30) return 1.4;
  if (driverAge < 40) return 1.0;
  if (driverAge < 55) return 0.95;
  return 1.05;
}

export function getExperienceFactor(yearsLicensed: number): number {
  if (yearsLicensed < 1) return 1.45;
  if (yearsLicensed < 3) return 1.2;
  if (yearsLicensed < 5) return 1.05;
  return 1.0;
}

export function getComprehensiveFactor(hasOwnDamage: boolean): number {
  return hasOwnDamage ? 1.55 : 1.0;
}

export function getAccidentFactor(history: AccidentHistory): number {
  if (history === "none") return 0.92;
  if (history === "one") return 1.35;
  return 1.75;
}

export function getRegionFactor(region: InsuranceRegion): number {
  if (region === "seoul") return 1.12;
  if (region === "gyeonggi") return 1.06;
  return 1.0;
}

export function getVehicleAgeFactor(year: number): number {
  const currentYear = new Date().getFullYear();
  const age = Math.max(0, currentYear - year);

  if (age <= 2) return 1.15;
  if (age <= 5) return 1.05;
  if (age <= 10) return 1.0;
  if (age <= 15) return 0.92;
  return 0.88;
}

export function getBaseMonthlyPremium(vehiclePrice: number, mileage: number): number {
  const priceComponent = vehiclePrice * 0.0022;
  const mileageComponent = mileage > 100_000 ? 8_000 : mileage > 60_000 ? 4_000 : 0;

  return Math.max(MIN_BASE_MONTHLY_KRW, priceComponent + mileageComponent);
}
