import { createHmac, timingSafeEqual } from "crypto";

import { SESSION_MAX_AGE_SECONDS } from "./constants";

function getSessionSecret(): string {
  const secret =
    process.env.SESSION_SECRET ?? process.env.TELEGRAM_BOT_TOKEN ?? "";

  if (!secret) {
    throw new Error("SESSION_SECRET or TELEGRAM_BOT_TOKEN must be set");
  }

  return secret;
}

export function createSessionToken(userId: string): string {
  const timestamp = Date.now().toString();
  const payload = `${userId}:${timestamp}`;
  const signature = createHmac("sha256", getSessionSecret())
    .update(payload)
    .digest("hex");

  return `${payload}.${signature}`;
}

export function verifySessionToken(token: string): string | null {
  const parts = token.split(".");

  if (parts.length !== 3) {
    return null;
  }

  const userId = parts[0];
  const timestamp = parts[1];
  const signature = parts[2];

  if (!userId || !timestamp || !signature) {
    return null;
  }

  const payload = `${userId}:${timestamp}`;
  const expectedSignature = createHmac("sha256", getSessionSecret())
    .update(payload)
    .digest("hex");

  const signatureBuffer = Buffer.from(signature, "hex");
  const expectedBuffer = Buffer.from(expectedSignature, "hex");

  if (
    signatureBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(signatureBuffer, expectedBuffer)
  ) {
    return null;
  }

  const ageMs = Date.now() - Number(timestamp);

  if (!Number.isFinite(ageMs) || ageMs < 0) {
    return null;
  }

  if (ageMs > SESSION_MAX_AGE_SECONDS * 1000) {
    return null;
  }

  return userId;
}
