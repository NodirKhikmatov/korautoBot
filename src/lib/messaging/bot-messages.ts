import { defaultLocale, isLocale, type Locale } from "@/i18n/config";

type BotMessageSet = {
  defaultUserName: string;
  sellerInquiry: {
    title: string;
    listing: string;
    buyer: string;
    replyHint: string;
  };
  buyerReply: {
    title: string;
    replyHint: string;
  };
  sellerFollowUp: {
    title: string;
    replyHint: string;
  };
  conversationStart: {
    connected: string;
    replyHint: string;
  };
};

const botMessages: Record<Locale, BotMessageSet> = {
  uz: {
    defaultUserName: "Foydalanuvchi",
    sellerInquiry: {
      title: "Yangi so'rov",
      listing: "E'lon",
      buyer: "Xaridor",
      replyHint: "Xaridorga javob berish uchun shu xabarga javob yozing.",
    },
    buyerReply: {
      title: "e'loni bo'yicha javob",
      replyHint: "Suhbatni davom ettirish uchun shu xabarga javob yozing.",
    },
    sellerFollowUp: {
      title: "e'loni bo'yicha yangi xabar",
      replyHint: "Javob berish uchun shu xabarga yozing.",
    },
    conversationStart: {
      connected: "e'loni bo'yicha suhbatga ulandingiz.",
      replyHint: "Suhbatni davom ettirish uchun bot xabarlariga javob yozing.",
    },
  },
  en: {
    defaultUserName: "User",
    sellerInquiry: {
      title: "New inquiry",
      listing: "Listing",
      buyer: "Buyer",
      replyHint: "Reply to this message to respond to the buyer.",
    },
    buyerReply: {
      title: "reply about",
      replyHint: "Reply to this message to continue the conversation.",
    },
    sellerFollowUp: {
      title: "New message about",
      replyHint: "Reply to this message to respond.",
    },
    conversationStart: {
      connected: "You are connected to the conversation about",
      replyHint: "Reply to bot messages to continue the conversation.",
    },
  },
  ko: {
    defaultUserName: "사용자",
    sellerInquiry: {
      title: "새 문의",
      listing: "매물",
      buyer: "구매자",
      replyHint: "구매자에게 답장하려면 이 메시지에 답장하세요.",
    },
    buyerReply: {
      title: "매물에 대한 판매자 답장",
      replyHint: "대화를 계속하려면 이 메시지에 답장하세요.",
    },
    sellerFollowUp: {
      title: "매물에 대한 새 메시지",
      replyHint: "답장하려면 이 메시지에 답장하세요.",
    },
    conversationStart: {
      connected: "매물 대화에 연결되었습니다",
      replyHint: "대화를 계속하려면 봇 메시지에 답장하세요.",
    },
  },
  ru: {
    defaultUserName: "Пользователь",
    sellerInquiry: {
      title: "Новый запрос",
      listing: "Объявление",
      buyer: "Покупатель",
      replyHint: "Ответьте на это сообщение, чтобы ответить покупателю.",
    },
    buyerReply: {
      title: "Ответ продавца по объявлению",
      replyHint: "Ответьте на это сообщение, чтобы продолжить диалог.",
    },
    sellerFollowUp: {
      title: "Новое сообщение по объявлению",
      replyHint: "Ответьте на это сообщение, чтобы ответить.",
    },
    conversationStart: {
      connected: "Вы подключены к диалогу по объявлению",
      replyHint: "Отвечайте на сообщения бота, чтобы продолжить диалог.",
    },
  },
};

export function resolveBotLocale(locale?: string | null): Locale {
  if (locale && isLocale(locale)) {
    return locale;
  }

  return defaultLocale;
}

export function getBotMessages(locale?: string | null): BotMessageSet {
  return botMessages[resolveBotLocale(locale)];
}
