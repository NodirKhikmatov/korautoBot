"use client";

import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api/fetch";
import {
  CARS_GC_TIME_MS,
  CARS_STALE_TIME_MS,
} from "@/lib/search/constants";
import type { CarFilterOptions } from "@/types";

type FilterOptionsResponse = {
  options: CarFilterOptions;
};

export function useCarFilterOptions(brand?: string) {
  return useQuery({
    queryKey: ["cars", "filter-options", brand ?? "all"],
    queryFn: () => {
      const params = brand ? `?brand=${encodeURIComponent(brand)}` : "";
      return apiFetch<FilterOptionsResponse>(`/api/cars/filters${params}`);
    },
    staleTime: CARS_STALE_TIME_MS,
    gcTime: CARS_GC_TIME_MS,
  });
}
