export function getPublicAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL?.trim() || "https://t.me";
}

export function getTelegramBotUsername(): string | null {
  const username =
    process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME ??
    process.env.TELEGRAM_BOT_USERNAME;

  if (!username?.trim()) {
    return null;
  }

  return username.replace(/^@/, "").trim();
}

export function getMiniAppWebAppUrl(appPath?: string): string {
  const base = getPublicAppUrl().replace(/\/$/, "");

  if (!appPath) {
    return base;
  }

  return `${base}${appPath.startsWith("/") ? appPath : `/${appPath}`}`;
}

/** t.me/…/app deep link for welcome text and fallback keyboard buttons. */
export function getTelegramMiniAppDeepLink(startParam?: string): string {
  const username = getTelegramBotUsername();

  if (!username) {
    if (startParam === "insurance") {
      return getMiniAppWebAppUrl("/tools/insurance");
    }

    return getMiniAppWebAppUrl();
  }

  const base = `https://t.me/${username}/app`;

  if (!startParam?.trim()) {
    return base;
  }

  return `${base}?startapp=${encodeURIComponent(startParam.trim())}`;
}

export function getTelegramMiniAppUrl(startParam?: string): string {
  return getTelegramMiniAppDeepLink(startParam);
}
