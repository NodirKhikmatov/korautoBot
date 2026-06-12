"use client";

import { useAuth } from "@/hooks/use-auth";

export function useTelegram() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  const webApp =
    typeof window !== "undefined" ? window.Telegram?.WebApp : undefined;

  return {
    user,
    isAuthenticated,
    isLoading,
    logout,
    webApp,
    initData: webApp?.initData ?? "",
    colorScheme: webApp?.colorScheme ?? "light",
  };
}

