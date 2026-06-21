import type { User } from "@/types";

import { getDevAuthTelegramId, isDevAuthEnabled } from "@/lib/auth/dev-auth";

export function getAdminTelegramIds(): number[] {
  const raw = process.env.ADMIN_TELEGRAM_IDS ?? "";
  const ids = raw
    .split(",")
    .map((value) => Number(value.trim()))
    .filter((id) => Number.isInteger(id) && id > 0);

  if (isDevAuthEnabled()) {
    const devId = getDevAuthTelegramId();
    if (!ids.includes(devId)) {
      ids.push(devId);
    }
  }

  return ids;
}

export function isAdminUser(user: User): boolean {
  if (user.bannedAt) {
    return false;
  }

  if (user.isAdmin) {
    return true;
  }

  if (isDevAuthEnabled() && user.telegramId === getDevAuthTelegramId()) {
    return true;
  }

  return getAdminTelegramIds().includes(user.telegramId);
}

export function isUserBanned(user: User): boolean {
  return user.bannedAt !== null;
}
