import { validateTelegramInitData } from "@/lib/telegram/validate-init-data";
import { upsertTelegramUser } from "@/services/users";
import type { User } from "@/types";

import { AuthConfigError, AuthError } from "./errors";
import { setSessionUserId } from "./session";

export async function authenticateTelegramInitData(
  initData: string,
): Promise<User> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;

  if (!botToken) {
    throw new AuthConfigError();
  }

  const validated = validateTelegramInitData(initData, botToken);

  if (!validated?.user) {
    throw new AuthError("Invalid Telegram initData");
  }

  const user = await upsertTelegramUser({
    telegramId: validated.user.id,
    username: validated.user.username ?? null,
    firstName: validated.user.first_name ?? null,
    lastName: validated.user.last_name ?? null,
    photoUrl: validated.user.photo_url ?? null,
  });

  await setSessionUserId(user.id);

  return user;
}
