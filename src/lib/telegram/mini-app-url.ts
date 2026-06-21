let cachedBotUsername: string | null | undefined;

export function getPublicAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL?.trim() || "https://t.me";
}

/** Runtime server env first — NEXT_PUBLIC_* is baked in at Docker build time. */
export function getTelegramBotUsername(): string | null {
  const username =
    process.env.TELEGRAM_BOT_USERNAME ??
    process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME;

  if (!username?.trim()) {
    return null;
  }

  return username.replace(/^@/, "").trim();
}

async function fetchBotUsernameFromTelegram(): Promise<string | null> {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  if (!token) {
    return null;
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/getMe`);
    const data = (await response.json()) as {
      ok?: boolean;
      result?: { username?: string };
    };

    const username = data.result?.username?.trim();
    return username ? username.replace(/^@/, "") : null;
  } catch (error) {
    console.error("[telegram] getMe failed while resolving bot username", {
      message: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}

/** Resolves bot username from env or Telegram getMe (cached). */
export async function resolveTelegramBotUsername(): Promise<string | null> {
  const fromEnv = getTelegramBotUsername();
  if (fromEnv) {
    return fromEnv;
  }

  if (cachedBotUsername !== undefined) {
    return cachedBotUsername;
  }

  cachedBotUsername = await fetchBotUsernameFromTelegram();
  return cachedBotUsername;
}

export function getMiniAppWebAppUrl(appPath?: string): string {
  const base = getPublicAppUrl().replace(/\/$/, "");

  if (!appPath) {
    return base;
  }

  return `${base}${appPath.startsWith("/") ? appPath : `/${appPath}`}`;
}

/** t.me/…/app deep link for welcome text and fallback keyboard buttons. */
export function getTelegramMiniAppDeepLink(
  startParam?: string,
  botUsername?: string | null,
): string {
  const username = botUsername ?? getTelegramBotUsername();

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

export function getTelegramMiniAppUrl(
  startParam?: string,
  botUsername?: string | null,
): string {
  return getTelegramMiniAppDeepLink(startParam, botUsername);
}
