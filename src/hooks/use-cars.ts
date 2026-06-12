"use client";

import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api/fetch";
import type { CarFilters, CarWithImages } from "@/types";

type CarsResponse = {
  cars: CarWithImages[];
  total: number;
};

function buildSearchParams(filters: CarFilters & { page?: number; limit?: number }) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== "") {
      params.set(key, String(value));
    }
  }

  return params.toString();
}

export function useCars(
  filters: CarFilters & { page?: number; limit?: number } = {},
) {
  const queryString = buildSearchParams(filters);

  return useQuery({
    queryKey: ["cars", filters],
    queryFn: () =>
      apiFetch<CarsResponse>(`/api/cars?${queryString}`),
  });
}
