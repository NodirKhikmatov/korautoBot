"use client";

import { useCallback } from "react";

import {
  openTelegramContact,
  openTelegramContactById,
} from "@/lib/telegram/contact";

export function useContactSeller({
  username,
  telegramId,
  phone,
}: {
  username?: string | null;
  telegramId?: number | null;
  phone?: string | null;
}) {
  const normalizedUsername = username?.trim() ?? null;
  const canContactByUsername = Boolean(normalizedUsername);
  const canContactByTelegramId = Boolean(telegramId);
  const canContactByPhone = Boolean(phone?.trim());
  const canContact =
    canContactByUsername || canContactByTelegramId || canContactByPhone;

  const contactSeller = useCallback(() => {
    if (normalizedUsername) {
      return openTelegramContact(normalizedUsername);
    }

    if (telegramId) {
      return openTelegramContactById(telegramId);
    }

    if (phone?.trim()) {
      window.location.href = `tel:${phone.trim()}`;
      return true;
    }

    return false;
  }, [normalizedUsername, telegramId, phone]);

  const contactLabel = canContactByUsername
    ? "Contact Seller"
    : canContactByTelegramId
      ? "Contact on Telegram"
      : canContactByPhone
        ? "Call Seller"
        : "Contact Seller";

  return { canContact, contactSeller, contactLabel };
}
