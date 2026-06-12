"use client";

import { useTheme } from "next-themes";
import { useEffect } from "react";

import { syncTelegramNativeChrome } from "@/lib/theme/telegram-chrome";

export function TelegramNativeChrome() {
  const { theme, resolvedTheme } = useTheme();

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (!tg) return;

    syncTelegramNativeChrome();

    const handleThemeChanged = () => syncTelegramNativeChrome();

    tg.onEvent?.("themeChanged", handleThemeChanged);

    return () => tg.offEvent?.("themeChanged", handleThemeChanged);
  }, [theme, resolvedTheme]);

  return null;
}
