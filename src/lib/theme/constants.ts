export const THEME_STORAGE_KEY = "korea-auto-market-theme";

export const THEME_PREFERENCES = ["light", "dark", "system"] as const;

export type ThemePreference = (typeof THEME_PREFERENCES)[number];

export type ResolvedTheme = "light" | "dark";

export const TELEGRAM_THEME_CSS_MAP: Record<string, string> = {
  bg_color: "--background",
  text_color: "--foreground",
  hint_color: "--muted-foreground",
  link_color: "--primary",
  button_color: "--primary",
  button_text_color: "--primary-foreground",
  secondary_bg_color: "--card",
};
