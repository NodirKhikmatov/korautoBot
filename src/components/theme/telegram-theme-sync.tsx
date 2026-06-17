"use client";

import { useTheme } from "next-themes";
import { useEffect } from "react";

import {
  applyTelegramCssVars,
  clearTelegramCssVars,
} from "@/lib/theme/telegram-theme";

export function TelegramThemeSync() {
  const { theme } = useTheme();

  useEffect(() => {
    const preference = theme ?? "system";
    const tg = window.Telegram?.WebApp;

    if (preference === "light" || preference === "dark") {
      clearTelegramCssVars();
      return;
    }

    if (!tg) {
      clearTelegramCssVars();
      return;
    }

    applyTelegramCssVars(
      tg.themeParams as Record<string, string | undefined>,
    );

    const handleThemeChanged = () => {
      applyTelegramCssVars(
        tg.themeParams as Record<string, string | undefined>,
      );
    };

    tg.onEvent?.("themeChanged", handleThemeChanged);
    return () => tg.offEvent?.("themeChanged", handleThemeChanged);
  }, [theme]);

  return null;
}
