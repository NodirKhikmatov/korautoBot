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
  handleBotInsurance,
  handleConversationStart,
  relayConversationReply,
} from "@/services/messaging";
import { markBotChatStarted } from "@/services/users";

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
      await markBotChatStarted(message.from.id);

      const payload = text.split(/\s+/)[1];
      const conversationId = parseConversationStartParam(payload);

      if (conversationId) {
        await handleConversationStart(message.from.id, conversationId);
      } else {
        await handleBotWelcome(message.from.id, message.from.language_code);
      }

      return NextResponse.json({ ok: true });
    }

    if (text.startsWith("/insurance") || text.startsWith("/보험")) {
      await markBotChatStarted(message.from.id);
      await handleBotInsurance(message.from.id, message.from.language_code);
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
    console.error("Telegram webhook error", {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json({ ok: true });
  }
}
