import { and, isNull } from "drizzle-orm";

import { withBypassRls } from "@/db/context";
import { users } from "@/db/schema";
import { formatBroadcastMessage } from "@/lib/messaging/format";
import { MessagingError } from "@/lib/messaging/errors";
import {
  buildOpenAppReplyMarkup,
  sendTelegramMessage,
} from "@/lib/telegram/bot-api";
import { markBotChatStarted } from "@/services/users";

/** ~20 messages/sec — stays under Telegram bulk limits */
const MESSAGE_INTERVAL_MS = 50;
const SEND_MAX_RETRIES = 5;

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
  const replyMarkup = buildOpenAppReplyMarkup();
  let sent = 0;
  let failed = 0;
  let notStarted = 0;

  for (let index = 0; index < recipientIds.length; index += 1) {
    const telegramId = recipientIds[index]!;

    let delivered = false;

    try {
      await sendTelegramMessage(telegramId, text, {
        maxRetries: SEND_MAX_RETRIES,
        replyMarkup,
      });
      sent += 1;
      delivered = true;
    } catch (error) {
      if (
        error instanceof MessagingError &&
        error.code === "BOT_CHAT_NOT_STARTED"
      ) {
        notStarted += 1;
      } else {
        failed += 1;
        if (process.env.NODE_ENV !== "test") {
          console.error("[broadcast] failed to send", {
            telegramId,
            code: error instanceof MessagingError ? error.code : "UNKNOWN",
            message: error instanceof Error ? error.message : String(error),
          });
        }
      }
    }

    if (delivered) {
      void markBotChatStarted(telegramId);
    }

    if (index + 1 < recipientIds.length) {
      await delay(MESSAGE_INTERVAL_MS);
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
