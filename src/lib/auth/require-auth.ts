import { NextResponse } from "next/server";

import type { User } from "@/types";

import { AuthError } from "./errors";
import { getCurrentUser } from "./get-current-user";

export function unauthorizedResponse(message = "Unauthorized") {
  return NextResponse.json({ error: message }, { status: 401 });
}

export async function requireAuth(): Promise<User> {
  const user = await getCurrentUser();

  if (!user) {
    throw new AuthError();
  }

  return user;
}

export function isAuthError(error: unknown): error is AuthError {
  return error instanceof AuthError;
}
