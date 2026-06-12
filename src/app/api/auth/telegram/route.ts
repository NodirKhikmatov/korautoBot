import { NextResponse } from "next/server";

import { authenticateTelegramInitData } from "@/lib/auth/authenticate-telegram";
import { handleAuthRouteError } from "@/lib/auth/handle-auth-route-error";
import { telegramAuthSchema } from "@/schemas/user";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { initData } = telegramAuthSchema.parse(body);
    const user = await authenticateTelegramInitData(initData);

    return NextResponse.json({ user });
  } catch (error) {
    return handleAuthRouteError(error, "Telegram auth error");
  }
}
