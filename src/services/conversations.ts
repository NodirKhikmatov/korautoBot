import { eq } from "drizzle-orm";

import { withBypassRls } from "@/db/context";
import { conversations, messages } from "@/db/schema";
import type { Conversation, Message } from "@/types";

export async function getOrCreateConversation(
  carId: string,
  buyerId: string,
  sellerId: string,
): Promise<{ conversation: Conversation; created: boolean }> {
  return withBypassRls(async (tx) => {
    const existing = await tx.query.conversations.findFirst({
      where: (table, { and, eq }) =>
        and(eq(table.carId, carId), eq(table.buyerId, buyerId)),
    });

    if (existing) {
      return { conversation: existing, created: false };
    }

    const [created] = await tx
      .insert(conversations)
      .values({
        carId,
        buyerId,
        sellerId,
      })
      .returning();

    if (!created) {
      throw new Error("Failed to create conversation");
    }

    return { conversation: created, created: true };
  });
}

export async function getConversationById(
  conversationId: string,
): Promise<Conversation | null> {
  return withBypassRls(async (tx) => {
    const conversation = await tx.query.conversations.findFirst({
      where: (table, { eq }) => eq(table.id, conversationId),
    });

    return conversation ?? null;
  });
}

export type ConversationWithContext = Conversation & {
  car: { id: string; title: string; isActive: boolean; soldAt: Date | null };
  buyer: {
    id: string;
    telegramId: number;
    username: string | null;
    firstName: string | null;
    lastName: string | null;
  };
  seller: {
    id: string;
    telegramId: number;
    username: string | null;
    firstName: string | null;
    lastName: string | null;
  };
};

export async function getConversationWithContext(
  conversationId: string,
): Promise<ConversationWithContext | null> {
  return withBypassRls(async (tx) => {
    const conversation = await tx.query.conversations.findFirst({
      where: (table, { eq }) => eq(table.id, conversationId),
      with: {
        car: {
          columns: {
            id: true,
            title: true,
            isActive: true,
            soldAt: true,
          },
        },
        buyer: {
          columns: {
            id: true,
            telegramId: true,
            username: true,
            firstName: true,
            lastName: true,
          },
        },
        seller: {
          columns: {
            id: true,
            telegramId: true,
            username: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return (conversation as ConversationWithContext | undefined) ?? null;
  });
}

export type MessageWithConversation = Message & {
  conversation: ConversationWithContext;
};

export async function getMessageByTelegramMessageId(
  telegramMessageId: number,
): Promise<MessageWithConversation | null> {
  return withBypassRls(async (tx) => {
    const message = await tx.query.messages.findFirst({
      where: (table, { eq }) => eq(table.telegramMessageId, telegramMessageId),
      with: {
        conversation: {
          with: {
            car: {
              columns: {
                id: true,
                title: true,
                isActive: true,
                soldAt: true,
              },
            },
            buyer: {
              columns: {
                id: true,
                telegramId: true,
                username: true,
                firstName: true,
                lastName: true,
              },
            },
            seller: {
              columns: {
                id: true,
                telegramId: true,
                username: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    if (!message) {
      return null;
    }

    return message as MessageWithConversation;
  });
}

export async function createRelayedMessage(input: {
  conversationId: string;
  senderId: string;
  body: string;
  direction: Message["direction"];
  telegramMessageId: number;
}): Promise<Message> {
  return withBypassRls(async (tx) => {
    const [message] = await tx
      .insert(messages)
      .values({
        conversationId: input.conversationId,
        senderId: input.senderId,
        body: input.body,
        direction: input.direction,
        telegramMessageId: input.telegramMessageId,
      })
      .returning();

    if (!message) {
      throw new Error("Failed to store message");
    }

    await tx
      .update(conversations)
      .set({ updatedAt: new Date() })
      .where(eq(conversations.id, input.conversationId));

    return message;
  });
}
