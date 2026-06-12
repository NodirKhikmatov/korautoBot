import { NextResponse } from "next/server";
import { ZodError } from "zod";

import {
  AuthConfigError,
  AuthError,
  ForbiddenError,
} from "@/lib/auth/errors";
import { FavoriteError } from "@/lib/favorites/errors";
import { ImageUploadError } from "@/lib/images/errors";

export function handleRouteError(
  error: unknown,
  logLabel = "Request error",
  fallbackMessage = "Request failed",
): NextResponse {
  if (error instanceof AuthError) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }

  if (error instanceof AuthConfigError) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (error instanceof ForbiddenError) {
    return NextResponse.json({ error: error.message }, { status: 403 });
  }

  if (error instanceof ImageUploadError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }

  if (error instanceof FavoriteError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }

  if (error instanceof ZodError) {
    return NextResponse.json(
      { error: "Invalid request", details: error.flatten() },
      { status: 400 },
    );
  }

  if (
    error instanceof Error &&
    (error.message.includes("R2") ||
      error.message.includes("environment variables are not configured"))
  ) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  console.error(logLabel, error);
  return NextResponse.json({ error: fallbackMessage }, { status: 500 });
}
