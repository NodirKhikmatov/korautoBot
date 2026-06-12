import { createHmac } from "crypto";

import type { TelegramInitData, TelegramUser } from "./types";

function parseInitData(initData: string): Record<string, string> {
  const params = new URLSearchParams(initData);
  const result: Record<string, string> = {};

  params.forEach((value, key) => {
    result[key] = value;
  });

  return result;
}

function buildDataCheckString(params: Record<string, string>): string {
  return Object.keys(params)
    .filter((key) => key !== "hash")
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("\n");
}

export function validateTelegramInitData(
  initData: string,
  botToken: string,
): TelegramInitData | null {
  const params = parseInitData(initData);
  const hash = params.hash;

  if (!hash) {
    return null;
  }

  const secretKey = createHmac("sha256", "WebAppData")
    .update(botToken)
    .digest();

  const dataCheckString = buildDataCheckString(params);
  const calculatedHash = createHmac("sha256", secretKey)
    .update(dataCheckString)
    .digest("hex");

  if (calculatedHash !== hash) {
    return null;
  }

  const authDate = Number(params.auth_date);
  const maxAgeSeconds = 86400;

  if (!authDate || Date.now() / 1000 - authDate > maxAgeSeconds) {
    return null;
  }

  let user: TelegramUser | undefined;

  if (params.user) {
    try {
      user = JSON.parse(params.user) as TelegramUser;
    } catch {
      return null;
    }
  }

  return {
    query_id: params.query_id,
    user,
    auth_date: authDate,
    hash,
    start_param: params.start_param,
  };
}
