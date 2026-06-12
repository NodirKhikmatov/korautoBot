"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SearchX } from "lucide-react";
import { useTranslations } from "next-intl";

import { CarFiltersPanel } from "@/components/cars/car-filters";
import { CarSearchResults } from "@/components/cars/car-search-results";
import { CarGridSkeleton } from "@/components/cars/car-grid";
import { EmptyState } from "@/components/layout/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { useCarsInfinite } from "@/hooks/use-cars-infinite";
import { useDebounce } from "@/hooks/use-debounce";
import {
  buildCarSearchParams,
  parseCarSearchParams,
} from "@/lib/search/params";
import type { CarFilters } from "@/types";

const EMPTY_FILTERS: CarFilters = {};

function SearchPageContent() {
  const t = useTranslations("search");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState<CarFilters>(() =>
    parseCarSearchParams(searchParams),
  );

  const debouncedSearch = useDebounce(filters.search, 400);

  const queryFilters = useMemo(
    () => ({
      ...filters,
      search: debouncedSearch,
    }),
    [filters, debouncedSearch],
  );

  const carsQuery = useCarsInfinite(queryFilters);
  const total = carsQuery.data?.pages[0]?.total;
  const hasResults =
    (carsQuery.data?.pages[0]?.cars.length ?? 0) > 0 ||
    (carsQuery.data?.pages.flatMap((p) => p.cars).length ?? 0) > 0;

  const syncUrl = useCallback(
    (nextFilters: CarFilters) => {
      const query = buildCarSearchParams({ ...nextFilters, page: 1 });
      const url = query ? `${pathname}?${query}` : pathname;
      router.replace(url, { scroll: false });
    },
    [pathname, router],
  );

  useEffect(() => {
    syncUrl({ ...filters, search: debouncedSearch });
  }, [filters, debouncedSearch, syncUrl]);

  return (
    <div className="space-y-5">
      <PageHeader
        title={t("title")}
        subtitle={
          total !== undefined
            ? t("listingsFound", { count: total })
            : t("subtitle")
        }
      />

      <CarFiltersPanel
        filters={filters}
        onChange={setFilters}
        onReset={() => setFilters(EMPTY_FILTERS)}
      />

      {carsQuery.isLoading && <CarGridSkeleton />}

      {!carsQuery.isLoading && !hasResults && (
        <EmptyState
          icon={SearchX}
          title={t("noMatchesTitle")}
          description={t("noMatchesDescription")}
        />
      )}

      <CarSearchResults query={carsQuery} />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<CarGridSkeleton />}>
      <SearchPageContent />
    </Suspense>
  );
}
