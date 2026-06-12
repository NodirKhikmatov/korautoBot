"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api/fetch";
import type { CarWithImages } from "@/types";

type FavoritesResponse = {
  favorites: CarWithImages[];
};

export function useFavorites(enabled = true) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["favorites"],
    queryFn: () => apiFetch<FavoritesResponse>("/api/favorites"),
    retry: false,
    enabled,
  });

  const addMutation = useMutation({
    mutationFn: (carId: string) =>
      apiFetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ carId }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
    },
  });

  const removeMutation = useMutation({
    mutationFn: (carId: string) =>
      apiFetch("/api/favorites", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ carId }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
    },
  });

  const favoriteIds = new Set(
    query.data?.favorites.map((car) => car.id) ?? [],
  );

  function isFavorite(carId: string): boolean {
    return favoriteIds.has(carId);
  }

  async function toggleFavorite(carId: string): Promise<void> {
    if (isFavorite(carId)) {
      await removeMutation.mutateAsync(carId);
    } else {
      await addMutation.mutateAsync(carId);
    }
  }

  return {
    favorites: query.data?.favorites ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    isFavorite,
    toggleFavorite,
    isToggling: addMutation.isPending || removeMutation.isPending,
  };
}
