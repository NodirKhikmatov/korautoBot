import { getUserById } from "@/services/users";
import type { User } from "@/types";

import { getSessionUserId } from "./session";

export async function getCurrentUser(): Promise<User | null> {
  const userId = await getSessionUserId();

  if (!userId) {
    return null;
  }

  return getUserById(userId);
}
