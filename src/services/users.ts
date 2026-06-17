import { eq } from "drizzle-orm";

import { withBypassRls } from "@/db/context";
import { users } from "@/db/schema";
import type { User } from "@/types";

export interface UpsertTelegramUserInput {
  telegramId: number;
  username?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  photoUrl?: string | null;
}

export async function upsertTelegramUser(
  input: UpsertTelegramUserInput,
): Promise<User> {
  return withBypassRls(async (tx) => {
    const [user] = await tx
      .insert(users)
      .values({
        telegramId: input.telegramId,
        username: input.username ?? null,
        firstName: input.firstName ?? null,
        lastName: input.lastName ?? null,
        photoUrl: input.photoUrl ?? null,
      })
      .onConflictDoUpdate({
        target: users.telegramId,
        set: {
          username: input.username ?? null,
          firstName: input.firstName ?? null,
          lastName: input.lastName ?? null,
          photoUrl: input.photoUrl ?? null,
          updatedAt: new Date(),
        },
      })
      .returning();

    if (!user) {
      throw new Error("Failed to upsert user");
    }

    return user;
  });
}

export async function getUserByTelegramId(
  telegramId: number,
): Promise<User | null> {
  return withBypassRls(async (tx) => {
    const user = await tx.query.users.findFirst({
      where: (table, { and, eq, isNull }) =>
        and(eq(table.telegramId, telegramId), isNull(table.deletedAt)),
    });

    return user ?? null;
  });
}

export async function getUserById(userId: string): Promise<User | null> {
  return withBypassRls(async (tx) => {
    const user = await tx.query.users.findFirst({
      where: (table, { and, eq, isNull }) =>
        and(eq(table.id, userId), isNull(table.deletedAt)),
    });

    return user ?? null;
  });
}

export async function markBotChatStarted(telegramId: number): Promise<void> {
  try {
    await withBypassRls(async (tx) => {
      await tx
        .update(users)
        .set({
          botStartedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(users.telegramId, telegramId));
    });
  } catch (error) {
    console.warn("[users] markBotChatStarted failed", {
      telegramId,
      message: error instanceof Error ? error.message : String(error),
    });
  }
}

export async function updateUserPhone(
  userId: string,
  phone: string | null,
): Promise<User> {
  return withBypassRls(async (tx) => {
    const [user] = await tx
      .update(users)
      .set({
        phone,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  });
}
