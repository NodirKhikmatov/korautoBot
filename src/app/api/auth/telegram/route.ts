import { NextResponse } from "next/server";

import { setSessionUserId } from "@/lib/auth/session";
import { validateTelegramInitData } from "@/lib/telegram/validate-init-data";
import { telegramAuthSchema } from "@/schemas/user";
import { upsertTelegramUser } from "@/services/users";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { initData } = telegramAuthSchema.parse(body);

    const botToken = process.env.TELEGRAM_BOT_TOKEN;

    if (!botToken) {
      return NextResponse.json(
        { error: "Telegram bot token not configured" },
        { status: 500 },
      );
    }

    const validated = validateTelegramInitData(initData, botToken);

    if (!validated?.user) {
      return NextResponse.json(
        { error: "Invalid Telegram initData" },
        { status: 401 },
      );
    }

    const user = await upsertTelegramUser({
      telegramId: validated.user.id,
      username: validated.user.username ?? null,
      firstName: validated.user.first_name ?? null,
      lastName: validated.user.last_name ?? null,
      photoUrl: validated.user.photo_url ?? null,
    });

    await setSessionUserId(user.id);

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Telegram auth error:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 },
    );
  }
}
