"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useAuth } from "@/hooks/use-auth";
import {
  FAVORITES_GC_TIME_MS,
  FAVORITES_STALE_TIME_MS,
} from "@/lib/favorites/constants";
import {
  addFavoriteApi,
  fetchFavorites,
  removeFavoriteApi,
  type FavoritesResponse,
} from "@/lib/favorites/fetch";
import type { CarWithImages } from "@/types";

function favoritesQueryKey(userId: string) {
  return ["favorites", userId] as const;
}

export function useFavorites(enabled = true) {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const userId = user?.id;
  const isEnabled = enabled && isAuthenticated && Boolean(userId);

  const query = useQuery({
    queryKey: favoritesQueryKey(userId ?? "anonymous"),
    queryFn: fetchFavorites,
    staleTime: FAVORITES_STALE_TIME_MS,
    gcTime: FAVORITES_GC_TIME_MS,
    retry: false,
    enabled: isEnabled,
  });

  function updateCache(updater: (data: FavoritesResponse) => FavoritesResponse) {
    if (!userId) return;
    queryClient.setQueryData<FavoritesResponse>(
      favoritesQueryKey(userId),
      (old) => {
        if (!old) return old;
        return updater(old);
      },
    );
  }

  const addMutation = useMutation({
    mutationFn: addFavoriteApi,
    onMutate: async (carId) => {
      if (!userId) return;
      await queryClient.cancelQueries({ queryKey: favoritesQueryKey(userId) });
      const previous = queryClient.getQueryData<FavoritesResponse>(
        favoritesQueryKey(userId),
      );

      updateCache((data) => ({
        ...data,
        carIds: data.carIds.includes(carId)
          ? data.carIds
          : [...data.carIds, carId],
        total: data.carIds.includes(carId) ? data.total : data.total + 1,
      }));

      return { previous };
    },
    onError: (_err, _carId, context) => {
      if (context?.previous && userId) {
        queryClient.setQueryData(favoritesQueryKey(userId), context.previous);
      }
    },
    onSettled: () => {
      if (userId) {
        queryClient.invalidateQueries({ queryKey: favoritesQueryKey(userId) });
      }
    },
  });

  const removeMutation = useMutation({
    mutationFn: removeFavoriteApi,
    onMutate: async (carId) => {
      if (!userId) return;
      await queryClient.cancelQueries({ queryKey: favoritesQueryKey(userId) });
      const previous = queryClient.getQueryData<FavoritesResponse>(
        favoritesQueryKey(userId),
      );

      updateCache((data) => ({
        favorites: data.favorites.filter((car) => car.id !== carId),
        carIds: data.carIds.filter((id) => id !== carId),
        total: data.carIds.includes(carId) ? data.total - 1 : data.total,
      }));

      return { previous };
    },
    onError: (_err, _carId, context) => {
      if (context?.previous && userId) {
        queryClient.setQueryData(favoritesQueryKey(userId), context.previous);
      }
    },
    onSettled: () => {
      if (userId) {
        queryClient.invalidateQueries({ queryKey: favoritesQueryKey(userId) });
      }
    },
  });

  const favoriteIds = new Set(query.data?.carIds ?? []);

  function isFavorite(carId: string): boolean {
    return favoriteIds.has(carId);
  }

  async function addFavorite(carId: string): Promise<void> {
    if (!isAuthenticated) return;
    await addMutation.mutateAsync(carId);
  }

  async function removeFavorite(carId: string): Promise<void> {
    if (!isAuthenticated) return;
    await removeMutation.mutateAsync(carId);
  }

  async function toggleFavorite(carId: string): Promise<void> {
    if (!isAuthenticated) return;
    if (isFavorite(carId)) {
      await removeFavorite(carId);
    } else {
      await addFavorite(carId);
    }
  }

  return {
    favorites: query.data?.favorites ?? [],
    carIds: query.data?.carIds ?? [],
    total: query.data?.total ?? 0,
    isLoading: query.isLoading,
    isError: query.isError,
    isAuthenticated,
    isFavorite,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isToggling: addMutation.isPending || removeMutation.isPending,
  };
}

export function useFavoriteCarIds() {
  const { carIds, isLoading, isAuthenticated } = useFavorites();
  return { carIds, isLoading, isAuthenticated };
}
