"use client";

import { useCallback, useMemo, useState } from "react";

import { ApiError, apiFetch } from "@/lib/api/fetch";
import { openPhoneContact } from "@/lib/contact/phone";
import { openTelegramBotChat } from "@/lib/telegram/bot-chat";
import { openTelegramContact } from "@/lib/telegram/contact";

type ContactSellerResponse = {
  mode: "telegram" | "phone" | "bot";
  conversationId?: string;
  created?: boolean;
  directChatUrl?: string;
  botChatUrl?: string | null;
  viewCount: number;
  contactCount: number;
};

export function useContactSeller(
  carId: string,
  username?: string | null,
  phone?: string | null,
) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasDirectChat = useMemo(
    () => Boolean(username?.trim() || phone?.trim()),
    [username, phone],
  );

  const openDirectChat = useCallback(async () => {
    if (!hasDirectChat) {
      return false;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await apiFetch<ContactSellerResponse>(
        `/api/cars/${carId}/contact`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        },
      );

      if (result.mode === "telegram" && username?.trim()) {
        openTelegramContact(username);
      } else if (result.mode === "phone" && phone?.trim()) {
        openPhoneContact(phone);
      }

      return true;
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Failed to contact seller";
      setError(message);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [carId, hasDirectChat, phone, username]);

  const sendInquiry = useCallback(
    async (message: string) => {
      setIsSubmitting(true);
      setError(null);

      try {
        const result = await apiFetch<ContactSellerResponse>(
          `/api/cars/${carId}/contact`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message }),
          },
        );

        if (result.botChatUrl) {
          openTelegramBotChat(result.botChatUrl);
        }

        return result;
      } catch (err) {
        const messageText =
          err instanceof ApiError
            ? err.message
            : err instanceof Error
              ? err.message
              : "Failed to send inquiry";
        setError(messageText);
        throw err;
      } finally {
        setIsSubmitting(false);
      }
    },
    [carId],
  );

  return {
    hasDirectChat,
    openDirectChat,
    sendInquiry,
    isSubmitting,
    error,
    clearError: () => setError(null),
  };
}
