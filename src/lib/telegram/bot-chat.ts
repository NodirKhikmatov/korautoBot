export function openTelegramBotChat(url: string): boolean {
  if (!url) {
    return false;
  }

  const webApp = window.Telegram?.WebApp;

  if (webApp?.openTelegramLink) {
    webApp.openTelegramLink(url);
  } else {
    window.open(url, "_blank", "noopener,noreferrer");
  }

  webApp?.HapticFeedback?.impactOccurred("light");
  return true;
}
