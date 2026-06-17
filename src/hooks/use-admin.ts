"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api/fetch";
import type { AdminStats, CarWithSeller } from "@/types";
import type { AdminCarListItem, AdminUserListItem } from "@/services/admin";

type AdminMeResponse = {
  isAdmin: boolean;
};

type AdminStatsResponse = {
  stats: AdminStats;
};

type AdminCarsResponse = {
  cars: AdminCarListItem[];
  total: number;
};

type AdminUsersResponse = {
  users: AdminUserListItem[];
  total: number;
};

export function useAdminAccess() {
  return useQuery({
    queryKey: ["admin", "me"],
    queryFn: () => apiFetch<AdminMeResponse>("/api/admin/me"),
    retry: false,
    staleTime: 60 * 1000,
  });
}

export function useAdminStats() {
  return useQuery({
    queryKey: ["admin", "stats"],
    queryFn: () => apiFetch<AdminStatsResponse>("/api/admin/stats"),
    staleTime: 30 * 1000,
  });
}

export function useAdminCars(search?: string, page = 1) {
  const params = new URLSearchParams({ page: String(page), limit: "20" });
  if (search) params.set("search", search);

  return useQuery({
    queryKey: ["admin", "cars", search ?? "", page],
    queryFn: () => apiFetch<AdminCarsResponse>(`/api/admin/cars?${params}`),
  });
}

export function useAdminCar(carId: string) {
  return useQuery({
    queryKey: ["admin", "car", carId],
    queryFn: () =>
      apiFetch<{ car: CarWithSeller }>(`/api/admin/cars/${carId}`),
    enabled: Boolean(carId),
  });
}

export function useAdminUsers(search?: string, page = 1) {
  const params = new URLSearchParams({ page: String(page), limit: "20" });
  if (search) params.set("search", search);

  return useQuery({
    queryKey: ["admin", "users", search ?? "", page],
    queryFn: () => apiFetch<AdminUsersResponse>(`/api/admin/users?${params}`),
  });
}

export function useAdminMutations() {
  const queryClient = useQueryClient();

  function invalidateAdmin() {
    queryClient.invalidateQueries({ queryKey: ["admin"] });
    queryClient.invalidateQueries({ queryKey: ["cars"] });
  }

  const deleteCar = useMutation({
    mutationFn: (carId: string) =>
      apiFetch(`/api/admin/cars/${carId}`, { method: "DELETE" }),
    onSuccess: invalidateAdmin,
  });

  const featureCar = useMutation({
    mutationFn: ({ carId, isFeatured }: { carId: string; isFeatured: boolean }) =>
      apiFetch(`/api/admin/cars/${carId}/feature`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFeatured }),
      }),
    onSuccess: invalidateAdmin,
  });

  const banUser = useMutation({
    mutationFn: ({ userId, banned }: { userId: string; banned: boolean }) =>
      apiFetch(`/api/admin/users/${userId}/ban`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ banned }),
      }),
    onSuccess: invalidateAdmin,
  });

  const updateCar = useMutation({
    mutationFn: ({
      carId,
      data,
    }: {
      carId: string;
      data: Record<string, unknown>;
    }) =>
      apiFetch(`/api/admin/cars/${carId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: invalidateAdmin,
  });

  const createCar = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      apiFetch<{ car: CarWithSeller }>("/api/admin/cars", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: invalidateAdmin,
  });

  return { deleteCar, featureCar, banUser, updateCar, createCar };
}

type AdminBroadcastPreviewResponse = {
  recipients: number;
};

type AdminBroadcastResponse = {
  success: true;
  result: {
    total: number;
    sent: number;
    failed: number;
    notStarted: number;
  };
};

export function useAdminBroadcast() {
  const recipientsQuery = useQuery({
    queryKey: ["admin", "broadcast", "recipients"],
    queryFn: () =>
      apiFetch<AdminBroadcastPreviewResponse>("/api/admin/broadcast"),
    staleTime: 30 * 1000,
  });

  const broadcastMutation = useMutation({
    mutationFn: (message: string) =>
      apiFetch<AdminBroadcastResponse>("/api/admin/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      }),
  });

  return {
    recipients: recipientsQuery.data?.recipients ?? 0,
    isLoadingRecipients: recipientsQuery.isLoading,
    broadcast: broadcastMutation.mutateAsync,
    isBroadcasting: broadcastMutation.isPending,
  };
}
