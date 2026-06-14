import { NextResponse } from "next/server";

import { parseConversationStartParam } from "@/lib/messaging/format";
import type { TelegramUpdate } from "@/lib/telegram/bot-types";
import {
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
      }

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
