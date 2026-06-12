import type { User } from "@/types";

import { isAdminUser } from "./admin";
import { AuthError, ForbiddenError } from "./errors";
import { getCurrentUser } from "./get-current-user";

export async function requireAdmin(): Promise<User> {
  const user = await getCurrentUser();

  if (!user) {
    throw new AuthError();
  }

  if (!isAdminUser(user)) {
    throw new ForbiddenError("Admin access required");
  }

  return user;
}
