import type {
  TelegramApiResponse,
  TelegramSendMessageResult,
} from "@/lib/telegram/bot-types";
import { MessagingError } from "@/lib/messaging/errors";

function getBotToken(): string {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    throw new MessagingError("Telegram bot is not configured", 500, "BOT_CONFIG");
  }
  return token;
}

export async function sendTelegramMessage(
  chatId: number,
  text: string,
): Promise<TelegramSendMessageResult> {
  const token = getBotToken();
  const response = await fetch(
    `https://api.telegram.org/bot${token}/sendMessage`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
      }),
    },
  );

  const data = (await response.json()) as TelegramApiResponse<TelegramSendMessageResult>;

  if (!data.ok || !data.result) {
    if (data.error_code === 403) {
      throw new MessagingError(
        "User has not started the bot yet",
        422,
        "BOT_CHAT_NOT_STARTED",
      );
    }

    throw new MessagingError(
      data.description ?? "Failed to send Telegram message",
      502,
      "BOT_SEND_FAILED",
    );
  }

  return data.result;
}

export function getTelegramBotChatUrl(
  botUsername: string,
  startParam?: string,
): string {
  const normalized = botUsername.replace(/^@/, "").trim();
  if (!normalized) {
    return "";
  }

  if (!startParam) {
    return `https://t.me/${normalized}`;
  }

  return `https://t.me/${normalized}?start=${encodeURIComponent(startParam)}`;
}

export function getTelegramBotUsername(): string | null {
  const username =
    process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME ??
    process.env.TELEGRAM_BOT_USERNAME;

  if (!username?.trim()) {
    return null;
  }

  return username.replace(/^@/, "").trim();
}
