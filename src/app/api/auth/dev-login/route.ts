import { NextResponse } from "next/server";

import { getDevAuthTelegramId, isDevAuthEnabled } from "@/lib/auth/dev-auth";
import { setSessionUserId } from "@/lib/auth/session";
import { upsertTelegramUser } from "@/services/users";

export async function POST() {
  if (!isDevAuthEnabled()) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const user = await upsertTelegramUser({
    telegramId: getDevAuthTelegramId(),
    username: "dev_browser",
    firstName: "Dev",
    lastName: "Browser",
    photoUrl: null,
    isAdmin: true,
  });

  await setSessionUserId(user.id);

  return NextResponse.json({ user });
}
