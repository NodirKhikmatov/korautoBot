"use client";

import { useCallback } from "react";

import { apiFetch } from "@/lib/api/fetch";
import { openTelegramContact } from "@/lib/telegram/contact";

export function useContactSeller(
  username?: string | null,
  carId?: string,
) {
  const canContact = Boolean(username?.trim());

  const contactSeller = useCallback(() => {
    if (carId) {
      apiFetch(`/api/cars/${carId}/contact`, { method: "POST" }).catch(
        () => {},
      );
    }

    if (!username) {
      return false;
    }

    return openTelegramContact(username);
  }, [carId, username]);

  return { canContact, contactSeller };
}
