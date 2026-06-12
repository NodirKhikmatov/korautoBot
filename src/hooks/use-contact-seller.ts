"use client";

import { useCallback } from "react";

import { openTelegramContact } from "@/lib/telegram/contact";

export function useContactSeller(username?: string | null) {
  const canContact = Boolean(username?.trim());

  const contactSeller = useCallback(() => {
    if (!username) {
      return false;
    }
    return openTelegramContact(username);
  }, [username]);

  return { canContact, contactSeller };
}
