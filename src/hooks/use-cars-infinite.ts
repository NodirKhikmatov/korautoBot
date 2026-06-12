"use client";

import { useInfiniteQuery } from "@tanstack/react-query";

import { fetchCars } from "@/lib/search/fetch-cars";
import {
  CARS_GC_TIME_MS,
  CARS_STALE_TIME_MS,
  SEARCH_PAGE_SIZE,
} from "@/lib/search/constants";
import type { CarSearchParams } from "@/lib/search/params";
import type { CarFilters } from "@/types";

export function useCarsInfinite(filters: CarFilters = {}) {
  const limit = SEARCH_PAGE_SIZE;

  return useInfiniteQuery({
    queryKey: ["cars", "infinite", filters, limit],
    queryFn: ({ pageParam }) =>
      fetchCars({
        ...filters,
        page: pageParam,
        limit,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.page + 1 : undefined,
    staleTime: CARS_STALE_TIME_MS,
    gcTime: CARS_GC_TIME_MS,
  });
}
