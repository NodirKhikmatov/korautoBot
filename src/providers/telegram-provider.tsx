"use client";

import { useEffect } from "react";

import { syncTelegramNativeChrome } from "@/lib/theme/telegram-chrome";
import { useAuthStore } from "@/stores/auth-store";

async function fetchSession(): Promise<boolean> {
  const response = await fetch("/api/auth/session", {
    method: "GET",
    credentials: "include",
  });

  if (response.status === 401) {
    return false;
  }

  if (!response.ok) {
    throw new Error("Failed to load session");
  }

  const { user } = await response.json();
  useAuthStore.getState().setUser(user);
  return true;
}

async function authenticateWithInitData(initData: string): Promise<void> {
  const response = await fetch("/api/auth/telegram", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ initData }),
  });

  if (!response.ok) {
    throw new Error("Telegram authentication failed");
  }

  const { user } = await response.json();
  useAuthStore.getState().setUser(user);
}

export function TelegramProvider({ children }: { children: React.ReactNode }) {
  const setLoading = useAuthStore((state) => state.setLoading);

  useEffect(() => {
    async function bootstrapAuth() {
      try {
        const hasSession = await fetchSession();

        if (hasSession) {
          return;
        }

        const initData = window.Telegram?.WebApp?.initData;

        if (!initData) {
          setLoading(false);
          return;
        }

        await authenticateWithInitData(initData);
      } catch {
        useAuthStore.getState().setUser(null);
      } finally {
        setLoading(false);
      }
    }

    const tg = window.Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand();
      document.documentElement.style.setProperty(
        "--tg-viewport-height",
        `${tg.viewportStableHeight ?? tg.viewportHeight ?? window.innerHeight}px`,
      );
      syncTelegramNativeChrome();
    }

    bootstrapAuth();
  }, [setLoading]);

  return <>{children}</>;
}
