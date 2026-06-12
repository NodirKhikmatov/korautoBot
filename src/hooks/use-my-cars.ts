"use client";

import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api/fetch";
import type { CarWithImages } from "@/types";

type MyCarsResponse = {
  cars: CarWithImages[];
};

export function useMyCars() {
  return useQuery({
    queryKey: ["my-cars"],
    queryFn: () => apiFetch<MyCarsResponse>("/api/cars/mine"),
    retry: false,
  });
}
