"use client";

import { useAuthStore } from "@/stores/auth-store";

export function useTelegram() {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);

  const webApp =
    typeof window !== "undefined" ? window.Telegram?.WebApp : undefined;

  return {
    user,
    isAuthenticated,
    isLoading,
    webApp,
    initData: webApp?.initData ?? "",
    colorScheme: webApp?.colorScheme ?? "light",
  };
}

export function getTelegramContactUrl(username: string): string {
  return `https://t.me/${username}`;
}
