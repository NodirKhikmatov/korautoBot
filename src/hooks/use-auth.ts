"use client";

import { useCallback } from "react";

import { useAuthStore } from "@/stores/auth-store";

export function useAuth() {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const logoutStore = useAuthStore((state) => state.logout);

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } finally {
      logoutStore();
    }
  }, [logoutStore]);

  return {
    user,
    isAuthenticated,
    isLoading,
    logout,
  };
}
