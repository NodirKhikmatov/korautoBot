/** Dev-only browser login — never enabled in production builds. */
export function isDevAuthEnabled(): boolean {
  return process.env.NODE_ENV !== "production";
}

export function getDevAuthTelegramId(): number {
  const raw = process.env.DEV_AUTH_TELEGRAM_ID;

  if (!raw) {
    return 999000001;
  }

  const id = Number(raw);

  if (!Number.isInteger(id) || id <= 0) {
    return 999000001;
  }

  return id;
}
