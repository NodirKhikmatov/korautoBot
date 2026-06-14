"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api/fetch";
import type { ListingStatusInput } from "@/schemas/listing-status";
import type { CarWithSeller } from "@/types";

type UpdateListingStatusResponse = {
  car: CarWithSeller;
};

export function useUpdateListingStatus(carId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ListingStatusInput) =>
      apiFetch<UpdateListingStatusResponse>(`/api/cars/${carId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      }),
    onSuccess: (data) => {
      queryClient.setQueryData(["car", carId], { car: data.car });
      queryClient.invalidateQueries({ queryKey: ["cars"] });
      queryClient.invalidateQueries({ queryKey: ["my-cars"] });
    },
  });
}
