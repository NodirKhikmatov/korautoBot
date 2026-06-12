"use client";

import { useEffect, useRef } from "react";

import { useAuth } from "@/hooks/use-auth";
import { apiFetch } from "@/lib/api/fetch";

export function useRecordCarView(carId: string, ownerId?: string) {
  const { user } = useAuth();
  const recorded = useRef(false);

  useEffect(() => {
    if (!carId || recorded.current) {
      return;
    }

    if (ownerId && user?.id === ownerId) {
      return;
    }

    recorded.current = true;

    apiFetch(`/api/cars/${carId}/view`, { method: "POST" }).catch(() => {});
  }, [carId, ownerId, user?.id]);
}
