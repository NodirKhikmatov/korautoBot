/**
 * Dev browser login — enabled in development, or when ALLOW_DEV_AUTH=true
 * (e.g. npm run start:local after a production build on localhost).
 */
export function isDevAuthEnabled(): boolean {
  if (process.env.ALLOW_DEV_AUTH === "true") {
    return true;
  }

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
