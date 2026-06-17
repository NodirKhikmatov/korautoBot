"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import {
  THEME_PREFERENCES,
  type ResolvedTheme,
  type ThemePreference,
} from "@/lib/theme/constants";
import {
  detectTelegramTheme,
  getTelegramColorScheme,
  isInTelegramMiniApp,
} from "@/lib/theme/detect-telegram-theme";

export function useThemePreference() {
  const { theme, setTheme, resolvedTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const preference = ((mounted ? theme : "system") ?? "system") as ThemePreference;
  const resolved = mounted
    ? (resolvedTheme as ResolvedTheme | undefined)
    : undefined;
  const isTelegram = mounted && isInTelegramMiniApp();
  const telegramScheme = mounted ? getTelegramColorScheme() : undefined;

  function setPreference(value: ThemePreference) {
    setTheme(value);
    window.Telegram?.WebApp?.HapticFeedback?.impactOccurred("light");
  }

  return {
    preference,
    resolvedTheme: resolved,
    systemTheme: systemTheme as ResolvedTheme | undefined,
    isTelegram,
    telegramScheme,
    telegramDetection: mounted ? detectTelegramTheme() : undefined,
    setPreference,
    preferences: THEME_PREFERENCES,
    mounted,
  };
}
