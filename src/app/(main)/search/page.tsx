"use client";

import { useState } from "react";
import { SearchX } from "lucide-react";

import { CarFiltersPanel } from "@/components/cars/car-filters";
import { CarGrid, CarGridSkeleton } from "@/components/cars/car-grid";
import { EmptyState } from "@/components/layout/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { useCars } from "@/hooks/use-cars";
import type { CarFilters } from "@/types";

const DEFAULT_FILTERS: CarFilters & { page?: number; limit?: number } = {
  limit: 20,
  page: 1,
};

export default function SearchPage() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const { data, isLoading, isFetching } = useCars(filters);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Search"
        subtitle={data ? `${data.total} listings found` : "Find your next car"}
      />

      <CarFiltersPanel
        filters={filters}
        onChange={setFilters}
        onReset={() => setFilters(DEFAULT_FILTERS)}
      />

      {(isLoading || isFetching) && <CarGridSkeleton />}

      {!isLoading && data?.cars.length === 0 && (
        <EmptyState
          icon={SearchX}
          title="No matches"
          description="Try adjusting your filters or search terms."
        />
      )}

      {data && data.cars.length > 0 && <CarGrid cars={data.cars} />}
    </div>
  );
}
