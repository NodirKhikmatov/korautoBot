import type { User } from "@/types";

export function getAdminTelegramIds(): number[] {
  const raw = process.env.ADMIN_TELEGRAM_IDS ?? "";
  return raw
    .split(",")
    .map((value) => Number(value.trim()))
    .filter((id) => Number.isInteger(id) && id > 0);
}

export function isAdminUser(user: User): boolean {
  if (user.bannedAt) {
    return false;
  }

  if (user.isAdmin) {
    return true;
  }

  return getAdminTelegramIds().includes(user.telegramId);
}

export function isUserBanned(user: User): boolean {
  return user.bannedAt !== null;
}
