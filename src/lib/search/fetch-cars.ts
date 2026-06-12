import { apiFetch } from "@/lib/api/fetch";
import { buildCarSearchParams, type CarSearchParams } from "@/lib/search/params";
import type { CarsListResult } from "@/types";

export async function fetchCars(
  filters: CarSearchParams,
): Promise<CarsListResult> {
  const query = buildCarSearchParams(filters);
  return apiFetch<CarsListResult>(`/api/cars?${query}`);
}
