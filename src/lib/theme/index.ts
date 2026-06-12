export {
  THEME_STORAGE_KEY,
  THEME_PREFERENCES,
  TELEGRAM_THEME_CSS_MAP,
  type ThemePreference,
  type ResolvedTheme,
} from "./constants";

export { resolveTheme, isThemePreference } from "./resolve-theme";

export {
  applyTelegramCssVars,
  clearTelegramCssVars,
} from "./telegram-theme";

export {
  isInTelegramMiniApp,
  getTelegramColorScheme,
  getTelegramThemeParams,
  detectTelegramTheme,
} from "./detect-telegram-theme";

export {
  readStoredThemePreference,
  writeStoredThemePreference,
} from "./persistence";

export { syncTelegramNativeChrome } from "./telegram-chrome";
export { getCssVariableHex } from "./color";
export { getThemeInitScript } from "./theme-init-script";
