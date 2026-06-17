"use client";

import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { TelegramNativeChrome } from "@/components/theme/telegram-native-chrome";
import { TelegramThemeSync } from "@/components/theme/telegram-theme-sync";
import { ThemeTransition } from "@/components/theme/theme-transition";
import { THEME_STORAGE_KEY } from "@/lib/theme/constants";
import { getTelegramColorScheme } from "@/lib/theme/detect-telegram-theme";
import { readStoredThemePreference } from "@/lib/theme/persistence";

/**
 * Theme resolution priority:
 * 1. User-selected preference (light / dark / system) — persisted in localStorage
 * 2. Telegram colorScheme when preference is system
 * 3. OS system preference (prefers-color-scheme)
 */
function TelegramForcedThemeSync({
  setForcedTheme,
}: {
  setForcedTheme: (theme: "light" | "dark" | undefined) => void;
}) {
  const { theme } = useTheme();

  useEffect(() => {
    if (theme !== "system") {
      setForcedTheme(undefined);
      return;
    }

    const sync = () => setForcedTheme(getTelegramColorScheme());

    sync();

    const tg = window.Telegram?.WebApp;
    tg?.onEvent?.("themeChanged", sync);

    return () => tg?.offEvent?.("themeChanged", sync);
  }, [theme, setForcedTheme]);

  return null;
}

function getInitialForcedTheme(): "light" | "dark" | undefined {
  if (typeof window === "undefined") return undefined;

  const preference = readStoredThemePreference();
  if (preference !== "system") return undefined;

  return getTelegramColorScheme();
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [forcedTheme, setForcedTheme] = useState<
    "light" | "dark" | undefined
  >(getInitialForcedTheme);

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      enableColorScheme
      storageKey={THEME_STORAGE_KEY}
      themes={["light", "dark", "system"]}
      forcedTheme={forcedTheme}
      disableTransitionOnChange={false}
    >
      <TelegramForcedThemeSync setForcedTheme={setForcedTheme} />
      <TelegramThemeSync />
      <TelegramNativeChrome />
      <ThemeTransition />
      {children}
    </NextThemesProvider>
  );
}
