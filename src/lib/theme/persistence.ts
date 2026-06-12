import { THEME_STORAGE_KEY, type ThemePreference } from "./constants";
import { isThemePreference } from "./resolve-theme";

/** Reads persisted theme preference from localStorage (next-themes storage). */
export function readStoredThemePreference(): ThemePreference {
  if (typeof window === "undefined") return "system";

  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored && isThemePreference(stored)) return stored;
  } catch {
    // localStorage may be unavailable in private mode
  }

  return "system";
}

/** Persists theme preference to localStorage. */
export function writeStoredThemePreference(preference: ThemePreference): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, preference);
  } catch {
    // ignore write failures
  }
}
