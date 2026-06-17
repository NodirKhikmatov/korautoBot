"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { z } from "zod";

import { apiFetch } from "@/lib/api/fetch";
import type { createListingSchema } from "@/schemas/car";
import type { CarWithSeller, User } from "@/types";

type CreateCarInput = z.infer<typeof createListingSchema>;

type CreateCarResponse = {
  car: CarWithSeller;
  user?: User;
};

export function useCreateCar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateCarInput) =>
      apiFetch<CreateCarResponse>("/api/cars", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cars"] });
      queryClient.invalidateQueries({ queryKey: ["my-cars"] });
    },
  });
}
