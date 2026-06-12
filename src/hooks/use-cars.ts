"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchCars } from "@/lib/search/fetch-cars";
import {
  CARS_GC_TIME_MS,
  CARS_STALE_TIME_MS,
} from "@/lib/search/constants";
import type { CarSearchParams } from "@/lib/search/params";

export function useCars(filters: CarSearchParams = {}) {
  return useQuery({
    queryKey: ["cars", filters],
    queryFn: () => fetchCars(filters),
    staleTime: CARS_STALE_TIME_MS,
    gcTime: CARS_GC_TIME_MS,
  });
}
