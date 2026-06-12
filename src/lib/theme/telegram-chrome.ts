import { getCssVariableHex } from "./color";

type TelegramChromeWebApp = {
  setHeaderColor?: (color: string) => void;
  setBackgroundColor?: (color: string) => void;
  setBottomBarColor?: (color: string) => void;
  themeParams?: Record<string, string | undefined>;
};

export function syncTelegramNativeChrome() {
  const tg = window.Telegram?.WebApp as TelegramChromeWebApp | undefined;
  if (!tg) return;

  const header =
    getCssVariableHex("--card") ??
    tg.themeParams?.secondary_bg_color ??
    tg.themeParams?.bg_color;
  const background =
    getCssVariableHex("--background") ?? tg.themeParams?.bg_color;

  if (header && tg.setHeaderColor) {
    tg.setHeaderColor(header);
  }

  if (background && tg.setBackgroundColor) {
    tg.setBackgroundColor(background);
  }

  const bottomBar = getCssVariableHex("--card");
  if (bottomBar && tg.setBottomBarColor) {
    tg.setBottomBarColor(bottomBar);
  }
}
