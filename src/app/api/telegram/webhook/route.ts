import { NextResponse } from "next/server";

import { getAdminTelegramIds } from "@/lib/auth/admin";
import { parseConversationStartParam } from "@/lib/messaging/format";
import type { TelegramUpdate } from "@/lib/telegram/bot-types";
import { sendTelegramMessage } from "@/lib/telegram/bot-api";
import {
  BROADCAST_COMMAND_HELP,
  formatBroadcastReport,
  sendBroadcastToAllUsers,
} from "@/services/broadcast";
import {
  handleBotWelcome,
  handleConversationStart,
  relayConversationReply,
} from "@/services/messaging";

function verifyWebhookSecret(request: Request): boolean {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (!secret) {
    return true;
  }

  return request.headers.get("x-telegram-bot-api-secret-token") === secret;
}

export async function POST(request: Request) {
  if (!verifyWebhookSecret(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const update = (await request.json()) as TelegramUpdate;
    const message = update.message;

    if (!message?.from || message.from.is_bot) {
      return NextResponse.json({ ok: true });
    }

    const text = message.text?.trim();
    if (!text) {
      return NextResponse.json({ ok: true });
    }

    if (text.startsWith("/start")) {
      const payload = text.split(/\s+/)[1];
      const conversationId = parseConversationStartParam(payload);

      if (conversationId) {
        await handleConversationStart(message.from.id, conversationId);
      } else {
        await handleBotWelcome(message.from.id, message.from.language_code);
      }

      return NextResponse.json({ ok: true });
    }

    if (text.startsWith("/broadcast")) {
      const adminIds = getAdminTelegramIds();

      if (!adminIds.includes(message.from.id)) {
        return NextResponse.json({ ok: true });
      }

      const broadcastText = text.slice("/broadcast".length).trim();

      if (!broadcastText) {
        await sendTelegramMessage(message.from.id, BROADCAST_COMMAND_HELP);
        return NextResponse.json({ ok: true });
      }

      const adminTelegramId = message.from.id;

      void (async () => {
        try {
          const result = await sendBroadcastToAllUsers(broadcastText);
          await sendTelegramMessage(
            adminTelegramId,
            formatBroadcastReport(result),
          );
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Broadcast failed";
          await sendTelegramMessage(adminTelegramId, `❌ ${errorMessage}`);
        }
      })();

      return NextResponse.json({ ok: true });
    }

    const replyToMessageId = message.reply_to_message?.message_id;
    if (replyToMessageId) {
      await relayConversationReply({
        telegramUserId: message.from.id,
        replyToTelegramMessageId: replyToMessageId,
        messageText: text,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Telegram webhook error", error);
    return NextResponse.json({ ok: true });
  }
}
