import { TELEGRAM_THEME_CSS_MAP } from "./constants";

export function applyTelegramCssVars(
  themeParams: Record<string, string | undefined>,
) {
  const root = document.documentElement;

  for (const [tgKey, cssVar] of Object.entries(TELEGRAM_THEME_CSS_MAP)) {
    const value = themeParams[tgKey];
    if (value) {
      root.style.setProperty(cssVar, value);
    }
  }
}

export function clearTelegramCssVars() {
  const root = document.documentElement;

  for (const cssVar of Object.values(TELEGRAM_THEME_CSS_MAP)) {
    root.style.removeProperty(cssVar);
  }
}

