import type { ResolvedTheme } from "./constants";

export function isInTelegramMiniApp(): boolean {
  return Boolean(typeof window !== "undefined" && window.Telegram?.WebApp);
}

export function getTelegramColorScheme(): ResolvedTheme | undefined {
  const scheme = window.Telegram?.WebApp?.colorScheme;
  if (scheme === "dark" || scheme === "light") return scheme;
  return undefined;
}

export function getTelegramThemeParams(): Record<string, string | undefined> {
  const params = window.Telegram?.WebApp?.themeParams;
  if (!params) return {};
  return params as Record<string, string | undefined>;
}

export function detectTelegramTheme(): {
  isTelegram: boolean;
  colorScheme?: ResolvedTheme;
  themeParams: Record<string, string | undefined>;
} {
  const tg = window.Telegram?.WebApp;
  if (!tg) {
    return { isTelegram: false, themeParams: {} };
  }

  return {
    isTelegram: true,
    colorScheme: getTelegramColorScheme(),
    themeParams: getTelegramThemeParams(),
  };
}
