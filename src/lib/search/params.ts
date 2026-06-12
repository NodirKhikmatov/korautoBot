import type { CarFilters } from "@/types";

export type CarSearchParams = CarFilters & {
  page?: number;
  limit?: number;
};

export function buildCarSearchParams(filters: CarSearchParams): string {
  const params = new URLSearchParams();

  const entries: Array<[string, string | number | undefined]> = [
    ["search", filters.search],
    ["brand", filters.brand],
    ["model", filters.model],
    ["minPrice", filters.minPrice],
    ["maxPrice", filters.maxPrice],
    ["minYear", filters.minYear],
    ["maxYear", filters.maxYear],
    ["minMileage", filters.minMileage],
    ["maxMileage", filters.maxMileage],
    ["fuelType", filters.fuelType],
    ["transmission", filters.transmission],
    ["region", filters.region],
    ["page", filters.page],
    ["limit", filters.limit],
  ];

  for (const [key, value] of entries) {
    if (value !== undefined && value !== "") {
      params.set(key, String(value));
    }
  }

  return params.toString();
}

export function parseCarSearchParams(
  searchParams: URLSearchParams,
): CarSearchParams {
  const num = (key: string) => {
    const value = searchParams.get(key);
    return value ? Number(value) : undefined;
  };

  const str = (key: string) => searchParams.get(key) ?? undefined;

  return {
    search: str("search"),
    brand: str("brand"),
    model: str("model"),
    minPrice: num("minPrice"),
    maxPrice: num("maxPrice"),
    minYear: num("minYear"),
    maxYear: num("maxYear"),
    minMileage: num("minMileage"),
    maxMileage: num("maxMileage"),
    fuelType: str("fuelType") as CarFilters["fuelType"],
    transmission: str("transmission") as CarFilters["transmission"],
    region: str("region"),
    page: num("page") ?? 1,
    limit: num("limit"),
  };
}

export function countActiveFilters(filters: CarFilters): number {
  let count = 0;
  if (filters.search) count += 1;
  if (filters.brand) count += 1;
  if (filters.model) count += 1;
  if (filters.minPrice) count += 1;
  if (filters.maxPrice) count += 1;
  if (filters.minYear) count += 1;
  if (filters.maxYear) count += 1;
  if (filters.minMileage) count += 1;
  if (filters.maxMileage) count += 1;
  if (filters.fuelType) count += 1;
  if (filters.transmission) count += 1;
  if (filters.region) count += 1;
  return count;
}
