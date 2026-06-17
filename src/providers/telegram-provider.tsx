"use client";

import { useEffect, useRef } from "react";

import { syncTelegramNativeChrome } from "@/lib/theme/telegram-chrome";
import { useAuthStore } from "@/stores/auth-store";

const TELEGRAM_INIT_RETRIES = 8;
const TELEGRAM_INIT_RETRY_MS = 250;

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
    const data = (await response.json().catch(() => null)) as
      | { error?: string }
      | null;
    throw new Error(data?.error ?? "Telegram authentication failed");
  }

  const { user } = await response.json();
  useAuthStore.getState().setUser(user);
}

function initTelegramWebApp() {
  const tg = window.Telegram?.WebApp;
  if (!tg) return;

  tg.ready();
  tg.expand();
  document.documentElement.style.setProperty(
    "--tg-viewport-height",
    `${tg.viewportStableHeight ?? tg.viewportHeight ?? window.innerHeight}px`,
  );
  syncTelegramNativeChrome();
}

function getInitData(): string | undefined {
  const initData = window.Telegram?.WebApp?.initData;
  return initData && initData.length > 0 ? initData : undefined;
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function TelegramProvider({ children }: { children: React.ReactNode }) {
  const setLoading = useAuthStore((state) => state.setLoading);
  const bootstrappedRef = useRef(false);

  useEffect(() => {
    if (bootstrappedRef.current) return;
    bootstrappedRef.current = true;

    let cancelled = false;

    async function tryTelegramLogin(): Promise<boolean> {
      const initData = getInitData();
      if (!initData) return false;

      await authenticateWithInitData(initData);
      return true;
    }

    async function bootstrapAuth() {
      initTelegramWebApp();

      try {
        const hasSession = await fetchSession();
        if (hasSession || cancelled) return;

        if (await tryTelegramLogin()) return;

        // Telegram SDK / initData can arrive slightly after first paint
        for (let attempt = 0; attempt < TELEGRAM_INIT_RETRIES && !cancelled; attempt++) {
          await wait(TELEGRAM_INIT_RETRY_MS);
          initTelegramWebApp();

          if (await tryTelegramLogin()) return;
        }
      } catch (error) {
        if (process.env.NODE_ENV !== "production") {
          console.error("[auth] Telegram bootstrap failed:", error);
        }
        useAuthStore.getState().setUser(null);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    bootstrapAuth();

    return () => {
      cancelled = true;
    };
  }, [setLoading]);

  return <>{children}</>;
}
