"use client";

import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api/fetch";
import { CARS_GC_TIME_MS, CARS_STALE_TIME_MS } from "@/lib/search/constants";
import type { CarWithImages } from "@/types";

export function useFeaturedCars() {
  return useQuery({
    queryKey: ["cars", "featured"],
    queryFn: () =>
      apiFetch<{ cars: CarWithImages[] }>("/api/cars/featured"),
    staleTime: CARS_STALE_TIME_MS,
    gcTime: CARS_GC_TIME_MS,
  });
}
