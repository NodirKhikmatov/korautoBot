import type {
  TelegramApiResponse,
  TelegramReplyMarkup,
  TelegramSendMessageResult,
} from "@/lib/telegram/bot-types";
import { getBotMessages } from "@/lib/messaging/bot-messages";
import { MessagingError } from "@/lib/messaging/errors";

const DEFAULT_MAX_RETRIES = 5;

export type SendTelegramMessageOptions = {
  maxRetries?: number;
  replyMarkup?: TelegramReplyMarkup;
};

export function getPublicAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL?.trim() || "https://t.me";
}

export function getTelegramMiniAppUrl(startParam?: string): string {
  const username = getTelegramBotUsername();
  if (!username) {
    return getPublicAppUrl();
  }

  const base = `https://t.me/${username}/app`;
  if (!startParam?.trim()) {
    return base;
  }

  return `${base}?startapp=${encodeURIComponent(startParam.trim())}`;
}

export function buildOpenAppReplyMarkup(
  locale?: string | null,
): TelegramReplyMarkup {
  const buttonText = getBotMessages(locale).openAppButton;

  return {
    inline_keyboard: [
      [
        {
          text: buttonText,
          web_app: { url: getPublicAppUrl() },
        },
      ],
    ],
  };
}

function getBotToken(): string {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    throw new MessagingError("Telegram bot is not configured", 500, "BOT_CONFIG");
  }
  return token;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function classifySendError(
  data: TelegramApiResponse<TelegramSendMessageResult>,
): MessagingError {
  if (data.error_code === 403) {
    return new MessagingError(
      data.description ?? "User has not started the bot yet",
      422,
      "BOT_CHAT_NOT_STARTED",
    );
  }

  if (data.error_code === 429) {
    return new MessagingError(
      data.description ?? "Telegram rate limit exceeded",
      429,
      "BOT_RATE_LIMITED",
    );
  }

  return new MessagingError(
    data.description ?? "Failed to send Telegram message",
    502,
    "BOT_SEND_FAILED",
  );
}

export async function sendTelegramMessage(
  chatId: number,
  text: string,
  options?: SendTelegramMessageOptions,
): Promise<TelegramSendMessageResult> {
  const token = getBotToken();
  const maxRetries = options?.maxRetries ?? DEFAULT_MAX_RETRIES;
  let attempt = 0;

  while (true) {
    attempt += 1;

    const body: {
      chat_id: number;
      text: string;
      reply_markup?: TelegramReplyMarkup;
    } = {
      chat_id: chatId,
      text,
    };

    if (options?.replyMarkup) {
      body.reply_markup = options.replyMarkup;
    }

    const response = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      },
    );

    const data = (await response.json()) as TelegramApiResponse<TelegramSendMessageResult>;

    if (data.ok && data.result) {
      return data.result;
    }

    if (data.error_code === 429 && attempt < maxRetries) {
      const retryAfterMs = (data.parameters?.retry_after ?? 1) * 1000 + 250;
      await delay(retryAfterMs);
      continue;
    }

    throw classifySendError(data);
  }
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
