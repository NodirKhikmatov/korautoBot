"use client";

import { useEffect } from "react";

import { useAuthStore } from "@/stores/auth-store";

export function TelegramProvider({ children }: { children: React.ReactNode }) {
  const setUser = useAuthStore((state) => state.setUser);
  const setLoading = useAuthStore((state) => state.setLoading);

  useEffect(() => {
    async function authenticate() {
      try {
        const initData =
          typeof window !== "undefined" &&
          window.Telegram?.WebApp?.initData;

        if (!initData) {
          setLoading(false);
          return;
        }

        const response = await fetch("/api/auth/telegram", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ initData }),
        });

        if (!response.ok) {
          setLoading(false);
          return;
        }

        const { user } = await response.json();
        setUser(user);
      } catch {
        setLoading(false);
      }
    }

    if (typeof window !== "undefined" && window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
    }

    authenticate();
  }, [setUser, setLoading]);

  return <>{children}</>;
}
