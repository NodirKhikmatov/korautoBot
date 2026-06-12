import { SESSION_MAX_AGE_SECONDS } from "./constants";

function getSessionSecret(): string {
  return process.env.SESSION_SECRET ?? process.env.TELEGRAM_BOT_TOKEN ?? "";
}

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function timingSafeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let mismatch = 0;

  for (let i = 0; i < a.length; i += 1) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return mismatch === 0;
}

export async function verifySessionTokenEdge(
  token: string,
): Promise<string | null> {
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

  const secret = getSessionSecret();

  if (!secret) {
    return null;
  }

  const payload = `${userId}:${timestamp}`;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signatureBuffer = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(payload),
  );
  const expectedSignature = toHex(signatureBuffer);

  if (!timingSafeEqualHex(signature, expectedSignature)) {
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
