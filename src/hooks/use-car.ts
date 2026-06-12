"use client";

import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api/fetch";
import type { CarWithSeller } from "@/types";

type CarResponse = {
  car: CarWithSeller;
};

export function useCar(carId: string) {
  return useQuery({
    queryKey: ["car", carId],
    queryFn: () => apiFetch<CarResponse>(`/api/cars/${carId}`),
    enabled: Boolean(carId),
  });
}
