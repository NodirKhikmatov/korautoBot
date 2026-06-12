"use client";

import { useEffect } from "react";

const THEME_MAP: Record<string, string> = {
  bg_color: "--background",
  text_color: "--foreground",
  hint_color: "--muted-foreground",
  link_color: "--primary",
  button_color: "--primary",
  button_text_color: "--primary-foreground",
  secondary_bg_color: "--card",
};

function applyTelegramTheme(
  themeParams: Record<string, string | undefined>,
) {
  const root = document.documentElement;

  for (const [tgKey, cssVar] of Object.entries(THEME_MAP)) {
    const value = themeParams[tgKey];
    if (value) {
      root.style.setProperty(cssVar, value);
    }
  }

  const scheme = window.Telegram?.WebApp?.colorScheme;
  if (scheme === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
}

export function useTelegramTheme() {
  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (!tg) return;

    applyTelegramTheme(
      tg.themeParams as Record<string, string | undefined>,
    );

    const handleThemeChanged = () => {
      applyTelegramTheme(
        tg.themeParams as Record<string, string | undefined>,
      );
    };

    tg.onEvent?.("themeChanged", handleThemeChanged);

    return () => {
      tg.offEvent?.("themeChanged", handleThemeChanged);
    };
  }, []);
}
