export function normalizeTelegramUsername(username: string): string {
  return username.replace(/^@/, "").trim();
}

export function getTelegramContactUrl(username: string): string {
  const normalized = normalizeTelegramUsername(username);
  if (!normalized) {
    return "";
  }
  return `https://t.me/${normalized}`;
}

export function formatTelegramUsername(username: string): string {
  const normalized = normalizeTelegramUsername(username);
  return normalized ? `@${normalized}` : "";
}

export function openTelegramContact(username: string): boolean {
  const url = getTelegramContactUrl(username);
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
