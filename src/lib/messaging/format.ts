import { getDisplayName } from "@/lib/format";
import { formatTelegramUsername } from "@/lib/telegram/contact";
import { getBotMessages } from "@/lib/messaging/bot-messages";
import type { User } from "@/types";

type ContactUser = Pick<User, "firstName" | "lastName" | "username">;

export function formatContactIdentity(
  user: ContactUser,
  locale?: string | null,
): string {
  const name = getDisplayName(user.firstName, user.lastName, user.username);
  if (name) {
    if (user.username && !name.includes("@")) {
      const handle = formatTelegramUsername(user.username);
      if (handle && handle !== name) {
        return `${name} (${handle})`;
      }
    }
    return name;
  }

  return getBotMessages(locale).defaultUserName;
}

export function formatUserDisplayName(
  user: ContactUser,
  locale?: string | null,
): string {
  return formatContactIdentity(user, locale);
}

export function formatSellerInquiryMessage(
  input: {
    carTitle: string;
    buyerName: string;
    message: string;
  },
  locale?: string | null,
): string {
  const t = getBotMessages(locale).sellerInquiry;

  return [
    t.title,
    "",
    `${t.listing}: ${input.carTitle}`,
    `${t.buyer}: ${input.buyerName}`,
    "",
    input.message,
    "",
    t.replyHint,
  ].join("\n");
}

export function formatBuyerReplyMessage(
  input: {
    carTitle: string;
    sellerName: string;
    message: string;
  },
  locale?: string | null,
): string {
  const t = getBotMessages(locale).buyerReply;

  return [
    `"${input.carTitle}" ${t.title} — ${input.sellerName}:`,
    "",
    input.message,
    "",
    t.replyHint,
  ].join("\n");
}

export function formatSellerFollowUpMessage(
  input: {
    carTitle: string;
    buyerName: string;
    message: string;
  },
  locale?: string | null,
): string {
  const t = getBotMessages(locale).sellerFollowUp;

  return [
    `"${input.carTitle}" ${t.title} — ${input.buyerName}:`,
    "",
    input.message,
    "",
    t.replyHint,
  ].join("\n");
}

export function formatWelcomeMessage(locale?: string | null): string {
  return getBotMessages(locale).welcome;
}

export function formatAdminSupportMessage(
  input: {
    user: Pick<User, "firstName" | "lastName" | "username" | "telegramId">;
    message: string;
  },
  locale?: string | null,
): string {
  const identity = formatContactIdentity(input.user, locale);
  const handle = input.user.username
    ? formatTelegramUsername(input.user.username)
    : null;
  const timestamp = new Intl.DateTimeFormat("uz-UZ", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "Asia/Seoul",
  }).format(new Date());

  return [
    "📩 Yangi murojaat — Korea Auto Market",
    "",
    `👤 Foydalanuvchi: ${identity}`,
    handle ? `📎 Username: ${handle}` : "📎 Username: yo'q",
    `🆔 Telegram ID: ${input.user.telegramId}`,
    `🕐 Vaqt: ${timestamp}`,
    "",
    "📝 Xabar:",
    input.message,
  ].join("\n");
}

export function formatBroadcastMessage(message: string): string {
  return ["📢 Korea Auto Market", "", message.trim()].join("\n");
}

export function formatConversationStartMessage(
  carTitle: string,
  locale?: string | null,
): string {
  const t = getBotMessages(locale).conversationStart;

  return [
    `"${carTitle}" ${t.connected}`,
    "",
    t.replyHint,
  ].join("\n");
}

export function formatConversationStartParam(conversationId: string): string {
  return `conv_${conversationId}`;
}

export function parseConversationStartParam(
  payload: string | undefined,
): string | null {
  if (!payload?.startsWith("conv_")) {
    return null;
  }

  const conversationId = payload.slice(4).trim();
  return conversationId.length > 0 ? conversationId : null;
}
