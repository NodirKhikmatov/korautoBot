"use client";

import type { InfiniteData, UseInfiniteQueryResult } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";

import { CarGrid } from "@/components/cars/car-grid";
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";
import type { CarsListResult } from "@/types";

type InfiniteCarsQuery = UseInfiniteQueryResult<
  InfiniteData<CarsListResult, unknown>,
  Error
>;

export function CarSearchResults({ query }: { query: InfiniteCarsQuery }) {
  const t = useTranslations("search");
  const {
    data,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = query;

  const sentinelRef = useInfiniteScroll({
    onLoadMore: () => fetchNextPage(),
    hasMore: Boolean(hasNextPage),
    isLoading: isFetchingNextPage,
  });

  const cars = data?.pages.flatMap((page) => page.cars) ?? [];
  const total = data?.pages[0]?.total ?? 0;

  if (cars.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        {t("showingResults", { shown: cars.length, total })}
      </p>
      <CarGrid cars={cars} />
      <div ref={sentinelRef} className="flex justify-center py-4">
        {isFetchingNextPage && (
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        )}
        {!hasNextPage && (
          <p className="text-xs text-muted-foreground">{t("endOfResults")}</p>
        )}
      </div>
    </div>
  );
}
