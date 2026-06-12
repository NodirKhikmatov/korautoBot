import { apiFetch } from "@/lib/api/fetch";
import type { CarWithImages } from "@/types";

export type FavoritesResponse = {
  favorites: CarWithImages[];
  carIds: string[];
  total: number;
};

export type FavoriteCheckResponse = {
  status: Record<string, boolean>;
};

export async function fetchFavorites(): Promise<FavoritesResponse> {
  return apiFetch<FavoritesResponse>("/api/favorites");
}

export async function fetchFavoriteStatus(
  carIds: string[],
): Promise<FavoriteCheckResponse> {
  const params = new URLSearchParams({
    carIds: carIds.join(","),
  });
  return apiFetch<FavoriteCheckResponse>(
    `/api/favorites/check?${params.toString()}`,
  );
}

export async function addFavoriteApi(carId: string): Promise<void> {
  await apiFetch("/api/favorites", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ carId }),
  });
}

export async function removeFavoriteApi(carId: string): Promise<void> {
  await apiFetch("/api/favorites", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ carId }),
  });
}
