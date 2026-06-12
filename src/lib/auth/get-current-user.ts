import { getUserById } from "@/services/users";
import type { User } from "@/types";

import { isUserBanned } from "./admin";
import { clearSession, getSessionUserId } from "./session";

export async function getCurrentUser(): Promise<User | null> {
  const userId = await getSessionUserId();

  if (!userId) {
    return null;
  }

  const user = await getUserById(userId);

  if (!user) {
    await clearSession();
    return null;
  }

  if (isUserBanned(user)) {
    await clearSession();
    return null;
  }

  return user;
}
