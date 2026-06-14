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
  welcome: string;
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
    welcome: [
      "🚗 Mashina sotmoqchimisiz yoki sotib olmoqchimisiz?",
      "",
      "Korea Auto Market — Koreyada ishlatilgan avtomobillar bozori!",
      "",
      "✅ E'lonni tekin joylashtiring",
      "✅ Mashinalarni oson qidiring",
      "✅ Rasmlar va ma'lumotlarni ko'ring",
      "✅ Tez va qulay foydalanish",
      "",
      "📱 Mini App: {appUrl}",
      "(yoki bot menyusidagi «Open App» tugmasini bosing)",
      "",
      "━━━━━━━━━━━━━━━━",
      "📖 Botdan qanday foydalaniladi?",
      "━━━━━━━━━━━━━━━━",
      "",
      "🔹 XARIDOR uchun:",
      "1. Mini App'ni oching",
      "2. Mashina e'lonini tanlang",
      "3. «Sotuvchi bilan bog'lanish» tugmasini bosing",
      "4. Savolingizni yozing — bot sotuvchiga yuboradi",
      "5. Sotuvchi javob berganda shu yerda ko'rasiz",
      "",
      "🔹 SOTUVCHI uchun:",
      "1. Botdan «Yangi so'rov» xabari keladi",
      "2. Shu xabarga Reply (↩️ javob) yozing",
      "3. Javobingiz xaridorga yetkaziladi",
      "",
      "⚠️ Muhim:",
      "• Oddiy xabar emas — bot xabariga Reply qiling",
      "• Avval /start bosing (bot ishga tushishi uchun)",
      "• Sotuvchida @username bo'lsa, to'g'ridan-to'g'ri chat ochiladi",
      "",
      "Taklif va fikrlaringizni kutamiz!",
      "Birinchi foydalanuvchilar uchun barcha e'lonlar bepul 🎉",
    ].join("\n"),
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
    welcome: [
      "🚗 Looking to sell or buy a car?",
      "",
      "Korea Auto Market — used cars marketplace in South Korea!",
      "",
      "✅ Post listings for free",
      "✅ Search cars easily",
      "✅ View photos and details",
      "✅ Fast and easy to use",
      "",
      "📱 Mini App: {appUrl}",
      "(or tap «Open App» in the bot menu)",
      "",
      "━━━━━━━━━━━━━━━━",
      "📖 How to use this bot",
      "━━━━━━━━━━━━━━━━",
      "",
      "🔹 For BUYERS:",
      "1. Open the Mini App",
      "2. Pick a car listing",
      "3. Tap «Contact seller»",
      "4. Send your question — the bot forwards it to the seller",
      "5. Seller replies appear here",
      "",
      "🔹 For SELLERS:",
      "1. You receive a «New inquiry» message from the bot",
      "2. Reply (↩️) to that message",
      "3. Your reply is sent to the buyer",
      "",
      "⚠️ Important:",
      "• Don't send plain messages — reply to bot messages",
      "• Send /start first to activate the bot",
      "• If the seller has @username, direct chat opens instead",
      "",
      "We welcome your feedback!",
      "All listings are free for early users 🎉",
    ].join("\n"),
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
    welcome: [
      "🚗 차를 팔거나 사고 싶으신가요?",
      "",
      "Korea Auto Market — 한국 중고차 마켓플레이스!",
      "",
      "✅ 무료로 매물 등록",
      "✅ 쉬운 차량 검색",
      "✅ 사진 및 상세 정보 확인",
      "✅ 빠르고 편리한 이용",
      "",
      "📱 Mini App: {appUrl}",
      "(또는 봇 메뉴의 «Open App» 버튼)",
      "",
      "━━━━━━━━━━━━━━━━",
      "📖 봇 사용 방법",
      "━━━━━━━━━━━━━━━━",
      "",
      "🔹 구매자:",
      "1. Mini App 열기",
      "2. 매물 선택",
      "3. «판매자에게 문의» 탭",
      "4. 질문 작성 — 봇이 판매자에게 전달",
      "5. 판매자 답장은 여기서 확인",
      "",
      "🔹 판매자:",
      "1. 봇에서 «새 문의» 메시지 수신",
      "2. 해당 메시지에 답장(↩️)",
      "3. 답장이 구매자에게 전달됨",
      "",
      "⚠️ 중요:",
      "• 일반 메시지가 아닌 봇 메시지에 답장하세요",
      "• 먼저 /start를 보내세요",
      "• 판매자에게 @username이 있으면 직접 채팅이 열립니다",
      "",
      "의견과 제안을 기다립니다!",
      "초기 사용자에게 모든 매물 등록이 무료입니다 🎉",
    ].join("\n"),
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
    welcome: [
      "🚗 Хотите продать или купить машину?",
      "",
      "Korea Auto Market — маркетплейс подержанных авто в Южной Корее!",
      "",
      "✅ Бесплатное размещение объявлений",
      "✅ Удобный поиск автомобилей",
      "✅ Фото и подробная информация",
      "✅ Быстро и удобно",
      "",
      "📱 Mini App: {appUrl}",
      "(или кнопка «Open App» в меню бота)",
      "",
      "━━━━━━━━━━━━━━━━",
      "📖 Как пользоваться ботом",
      "━━━━━━━━━━━━━━━━",
      "",
      "🔹 Для ПОКУПАТЕЛЯ:",
      "1. Откройте Mini App",
      "2. Выберите объявление",
      "3. Нажмите «Связаться с продавцом»",
      "4. Напишите вопрос — бот перешлёт продавцу",
      "5. Ответ продавца придёт сюда",
      "",
      "🔹 Для ПРОДАВЦА:",
      "1. Получите сообщение «Новый запрос» от бота",
      "2. Ответьте (↩️) на это сообщение",
      "3. Ответ будет отправлен покупателю",
      "",
      "⚠️ Важно:",
      "• Не пишите обычные сообщения — отвечайте на сообщения бота",
      "• Сначала отправьте /start",
      "• Если у продавца есть @username, откроется прямой чат",
      "",
      "Ждём ваши предложения и отзывы!",
      "Для первых пользователей все объявления бесплатны 🎉",
    ].join("\n"),
  },
};

export function resolveBotLocale(locale?: string | null): Locale {
  if (locale && isLocale(locale)) {
    return locale;
  }

  return defaultLocale;
}

export function resolveBotLocaleFromTelegram(
  languageCode?: string | null,
): Locale {
  const code = languageCode?.split("-")[0]?.toLowerCase();
  if (code && isLocale(code)) {
    return code;
  }

  return defaultLocale;
}

export function getBotMessages(locale?: string | null): BotMessageSet {
  return botMessages[resolveBotLocale(locale)];
}
