import { and, isNull } from "drizzle-orm";

import { withBypassRls } from "@/db/context";
import { users } from "@/db/schema";
import { formatBroadcastMessage } from "@/lib/messaging/format";
import { MessagingError } from "@/lib/messaging/errors";
import { sendTelegramMessage } from "@/lib/telegram/bot-api";

const BATCH_SIZE = 25;
const BATCH_DELAY_MS = 1000;

export type BroadcastResult = {
  total: number;
  sent: number;
  failed: number;
  notStarted: number;
};

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export async function getBroadcastRecipientCount(): Promise<number> {
  const ids = await getBroadcastRecipientTelegramIds();
  return ids.length;
}

async function getBroadcastRecipientTelegramIds(): Promise<number[]> {
  return withBypassRls(async (tx) => {
    const rows = await tx
      .select({ telegramId: users.telegramId })
      .from(users)
      .where(and(isNull(users.deletedAt), isNull(users.bannedAt)));

    return rows.map((row) => row.telegramId);
  });
}

export async function sendBroadcastToAllUsers(
  message: string,
): Promise<BroadcastResult> {
  const trimmed = message.trim();

  if (!trimmed) {
    throw new MessagingError("Message is required", 400, "MESSAGE_REQUIRED");
  }

  const recipientIds = await getBroadcastRecipientTelegramIds();

  if (recipientIds.length === 0) {
    throw new MessagingError("No recipients found", 404, "NO_RECIPIENTS");
  }

  const text = formatBroadcastMessage(trimmed);
  let sent = 0;
  let failed = 0;
  let notStarted = 0;

  for (let index = 0; index < recipientIds.length; index += BATCH_SIZE) {
    const batch = recipientIds.slice(index, index + BATCH_SIZE);

    const results = await Promise.allSettled(
      batch.map((telegramId) => sendTelegramMessage(telegramId, text)),
    );

    for (const result of results) {
      if (result.status === "fulfilled") {
        sent += 1;
        continue;
      }

      if (
        result.reason instanceof MessagingError &&
        result.reason.code === "BOT_CHAT_NOT_STARTED"
      ) {
        notStarted += 1;
        continue;
      }

      failed += 1;
    }

    if (index + BATCH_SIZE < recipientIds.length) {
      await delay(BATCH_DELAY_MS);
    }
  }

  if (sent === 0) {
    throw new MessagingError(
      "Broadcast could not be delivered to any user",
      502,
      "BROADCAST_FAILED",
    );
  }

  return {
    total: recipientIds.length,
    sent,
    failed,
    notStarted,
  };
}

export function formatBroadcastReport(result: BroadcastResult): string {
  return [
    "✅ Broadcast yuborildi",
    "",
    `👥 Jami: ${result.total}`,
    `📨 Yetkazildi: ${result.sent}`,
    result.notStarted > 0
      ? `⚠️ Botni ochmagan: ${result.notStarted}`
      : null,
    result.failed > 0 ? `❌ Xato: ${result.failed}` : null,
  ]
    .filter(Boolean)
    .join("\n");
}

export const BROADCAST_COMMAND_HELP = [
  "📢 Broadcast",
  "",
  "Barcha foydalanuvchilarga xabar yuborish:",
  "/broadcast Xabaringiz matni",
  "",
  "Misol:",
  "/broadcast Yangi e'lonlar qo'shildi, ko'rib chiqing!",
  "",
  "Yoki Admin panel → Broadcast bo'limidan yuboring.",
].join("\n");
