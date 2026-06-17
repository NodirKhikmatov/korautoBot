import { useTranslations } from "next-intl";

import type { FuelType, TransmissionType } from "@/types";

export function useTranslatedFormat() {
  const tFuel = useTranslations("fuel");
  const tTransmission = useTranslations("transmission");

  return {
    formatFuelType: (fuel: FuelType) => tFuel(fuel),
    formatTransmission: (transmission: TransmissionType) =>
      tTransmission(transmission),
  };
}
