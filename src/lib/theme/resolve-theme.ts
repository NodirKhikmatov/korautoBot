import type { ResolvedTheme, ThemePreference } from "./constants";

export function resolveTheme(
  preference: ThemePreference | undefined,
  telegramScheme?: ResolvedTheme,
  systemDark?: boolean,
): ResolvedTheme {
  if (preference === "light") return "light";
  if (preference === "dark") return "dark";

  if (telegramScheme) return telegramScheme;
  if (systemDark !== undefined) return systemDark ? "dark" : "light";

  return "light";
}

export function isThemePreference(value: string): value is ThemePreference {
  return value === "light" || value === "dark" || value === "system";
}
