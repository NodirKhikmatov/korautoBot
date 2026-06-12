import type { FuelType, TransmissionType } from "@/types";

const FUEL_LABELS: Record<FuelType, string> = {
  gasoline: "Gasoline",
  diesel: "Diesel",
  electric: "Electric",
  hybrid: "Hybrid",
  lpg: "LPG",
};

const TRANSMISSION_LABELS: Record<TransmissionType, string> = {
  automatic: "Automatic",
  manual: "Manual",
};

export function formatFuelType(fuel: FuelType): string {
  return FUEL_LABELS[fuel];
}

export function formatTransmission(transmission: TransmissionType): string {
  return TRANSMISSION_LABELS[transmission];
}

export function getTelegramContactUrl(username: string): string {
  return `https://t.me/${username.replace(/^@/, "")}`;
}

export function getDisplayName(
  firstName?: string | null,
  lastName?: string | null,
  username?: string | null,
): string {
  const name = [firstName, lastName].filter(Boolean).join(" ").trim();
  if (name) return name;
  if (username) return username;
  return "User";
}
