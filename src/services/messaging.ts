import { MessagingError } from "@/lib/messaging/errors";
import { resolveBotWelcomeLocale } from "@/lib/messaging/bot-messages";
import {
  formatBuyerReplyMessage,
  formatConversationStartMessage,
  formatConversationStartParam,
  formatSellerFollowUpMessage,
  formatSellerInquiryMessage,
  formatContactIdentity,
  formatWelcomeMessage,
} from "@/lib/messaging/format";
import {
  getTelegramBotChatUrl,
  getTelegramBotUsername,
  sendTelegramMessage,
  buildWelcomeReplyMarkup,
  buildInsuranceCalculatorReplyMarkup,
} from "@/lib/telegram/bot-api";
import { getBotMessages } from "@/lib/messaging/bot-messages";
import { recordCarContact } from "@/services/car-analytics";
import {
  createRelayedMessage,
  getConversationWithContext,
  getMessageByTelegramMessageId,
  getOrCreateConversation,
} from "@/services/conversations";
import { canContactListing } from "@/lib/listing/status";
import { getCarForContact } from "@/services/cars";
import { getTelegramContactUrl, getTelegramIdContactUrl } from "@/lib/telegram/contact";
import { getPhoneContactUrl } from "@/lib/contact/phone";
import { defaultLocale, type Locale } from "@/i18n/config";
import type { User } from "@/types";

export type ContactSellerResult = {
  mode: "telegram" | "phone" | "bot";
  conversationId?: string;
  created?: boolean;
  directChatUrl?: string;
  botChatUrl?: string | null;
  viewCount: number;
  contactCount: number;
};

export async function contactSeller(
  buyer: User,
  carId: string,
  inquiryMessage?: string,
  locale: Locale = defaultLocale,
): Promise<ContactSellerResult> {
  const car = await getCarForContact(carId);

  if (!car || !canContactListing(car)) {
    throw new MessagingError("Car not found", 404, "CAR_NOT_FOUND");
  }

  if (buyer.id === car.userId) {
    throw new MessagingError("You cannot contact yourself", 400, "SELF_CONTACT");
  }

  const sellerUsername = car.seller.username?.trim();
  if (sellerUsername) {
    const analytics = await recordCarContact(car.id, buyer.id);

    return {
      mode: "telegram",
      directChatUrl: getTelegramContactUrl(sellerUsername),
      viewCount: analytics.viewCount,
      contactCount: analytics.contactCount,
    };
  }

  const sellerPhone = car.seller.phone?.trim();
  if (sellerPhone) {
    const analytics = await recordCarContact(car.id, buyer.id);

    return {
      mode: "phone",
      directChatUrl: getPhoneContactUrl(sellerPhone),
      viewCount: analytics.viewCount,
      contactCount: analytics.contactCount,
    };
  }

  if (car.isExternalSeller && car.externalTelegramId) {
    const analytics = await recordCarContact(car.id, buyer.id);

    return {
      mode: "telegram",
      directChatUrl: getTelegramIdContactUrl(car.externalTelegramId),
      viewCount: analytics.viewCount,
      contactCount: analytics.contactCount,
    };
  }

  const message = inquiryMessage?.trim();
  if (!message) {
    throw new MessagingError("Message is required", 400, "MESSAGE_REQUIRED");
  }

  return sendSellerInquiryViaBot(buyer, car, message, locale);
}

async function sendSellerInquiryViaBot(
  buyer: User,
  car: NonNullable<Awaited<ReturnType<typeof getCarForContact>>>,
  inquiryMessage: string,
  locale: Locale = defaultLocale,
): Promise<ContactSellerResult> {
  const { conversation, created } = await getOrCreateConversation(
    car.id,
    buyer.id,
    car.userId,
  );
  const buyerName = formatContactIdentity(buyer, locale);
  const sellerText = formatSellerInquiryMessage(
    {
      carTitle: car.title,
      buyerName,
      message: inquiryMessage,
    },
    locale,
  );

  const telegramResult = await sendTelegramMessage(
    car.seller.telegramId,
    sellerText,
  );

  await createRelayedMessage({
    conversationId: conversation.id,
    senderId: buyer.id,
    body: inquiryMessage,
    direction: "buyer_to_seller",
    telegramMessageId: telegramResult.message_id,
  });

  const analytics = await recordCarContact(car.id, buyer.id);
  const botUsername = getTelegramBotUsername();

  return {
    mode: "bot",
    conversationId: conversation.id,
    created,
    botChatUrl: botUsername
      ? getTelegramBotChatUrl(
          botUsername,
          formatConversationStartParam(conversation.id),
        )
      : null,
    viewCount: analytics.viewCount,
    contactCount: analytics.contactCount,
  };
}

export async function relayConversationReply(input: {
  telegramUserId: number;
  replyToTelegramMessageId: number;
  messageText: string;
}): Promise<boolean> {
  const trimmed = input.messageText.trim();
  if (!trimmed) {
    return false;
  }

  const context = await getMessageByTelegramMessageId(
    input.replyToTelegramMessageId,
  );

  if (!context) {
    return false;
  }

  const conversation = context.conversation;

  if (!canContactListing(conversation.car)) {
    return false;
  }

  const isSeller = conversation.seller.telegramId === input.telegramUserId;
  const isBuyer = conversation.buyer.telegramId === input.telegramUserId;

  if (!isSeller && !isBuyer) {
    return false;
  }

  if (isSeller) {
    const sellerName = formatContactIdentity(conversation.seller, defaultLocale);
    const buyerText = formatBuyerReplyMessage(
      {
        carTitle: conversation.car.title,
        sellerName,
        message: trimmed,
      },
      defaultLocale,
    );

    const telegramResult = await sendTelegramMessage(
      conversation.buyer.telegramId,
      buyerText,
    );

    await createRelayedMessage({
      conversationId: conversation.id,
      senderId: conversation.seller.id,
      body: trimmed,
      direction: "seller_to_buyer",
      telegramMessageId: telegramResult.message_id,
    });

    return true;
  }

  const buyerName = formatContactIdentity(conversation.buyer, defaultLocale);
  const sellerText = formatSellerFollowUpMessage(
    {
      carTitle: conversation.car.title,
      buyerName,
      message: trimmed,
    },
    defaultLocale,
  );

  const telegramResult = await sendTelegramMessage(
    conversation.seller.telegramId,
    sellerText,
  );

  await createRelayedMessage({
    conversationId: conversation.id,
    senderId: conversation.buyer.id,
    body: trimmed,
    direction: "buyer_to_seller",
    telegramMessageId: telegramResult.message_id,
  });

  return true;
}

export async function handleBotWelcome(
  telegramUserId: number,
  languageCode?: string | null,
): Promise<void> {
  const locale = resolveBotWelcomeLocale(languageCode);

  await sendTelegramMessage(telegramUserId, formatWelcomeMessage(locale), {
    replyMarkup: buildWelcomeReplyMarkup(locale),
  });
}

export async function handleBotInsurance(
  telegramUserId: number,
  languageCode?: string | null,
): Promise<void> {
  const locale = resolveBotWelcomeLocale(languageCode);
  const message = getBotMessages(locale).insuranceWelcome;

  await sendTelegramMessage(telegramUserId, message, {
    replyMarkup: buildInsuranceCalculatorReplyMarkup(locale),
  });
}

export async function handleConversationStart(
  telegramUserId: number,
  conversationId: string,
): Promise<void> {
  const conversation = await getConversationWithContext(conversationId);

  if (!conversation) {
    return;
  }

  const isParticipant =
    conversation.buyer.telegramId === telegramUserId ||
    conversation.seller.telegramId === telegramUserId;

  if (!isParticipant) {
    return;
  }

  await sendTelegramMessage(
    telegramUserId,
    formatConversationStartMessage(conversation.car.title, defaultLocale),
  );
}
