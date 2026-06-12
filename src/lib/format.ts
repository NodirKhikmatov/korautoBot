import type { FuelType, TransmissionType } from "@/types";

export function getDisplayName(
  firstName?: string | null,
  lastName?: string | null,
  username?: string | null,
): string {
  const name = [firstName, lastName].filter(Boolean).join(" ").trim();
  if (name) return name;
  if (username) return username;
  return "";
}

export function getFuelTypeKey(fuel: FuelType): `fuel.${FuelType}` {
  return `fuel.${fuel}`;
}

export function getTransmissionKey(
  transmission: TransmissionType,
): `transmission.${TransmissionType}` {
  return `transmission.${transmission}`;
}
