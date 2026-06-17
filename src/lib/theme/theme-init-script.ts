import { THEME_STORAGE_KEY } from "./constants";

/**
 * Blocking script for the document head — prevents theme flash before React hydrates.
 * Priority: user preference → Telegram colorScheme → system preference.
 */
export function getThemeInitScript(): string {
  return `
(function () {
  try {
    var storageKey = "${THEME_STORAGE_KEY}";
    var preference = localStorage.getItem(storageKey) || "system";
    if (preference !== "light" && preference !== "dark" && preference !== "system") {
      preference = "system";
    }

    var isDark = false;

    if (preference === "dark") {
      isDark = true;
    } else if (preference === "light") {
      isDark = false;
    } else {
      var tgScheme = window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.colorScheme;
      if (tgScheme === "dark") {
        isDark = true;
      } else if (tgScheme === "light") {
        isDark = false;
      } else {
        isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      }
    }

    var root = document.documentElement;
    if (isDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  } catch (e) {}
})();
`.trim();
}
