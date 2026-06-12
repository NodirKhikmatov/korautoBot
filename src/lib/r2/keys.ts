import { randomBytes } from "crypto";

export type CarImageKeys = {
  imageId: string;
  mainKey: string;
  thumbKey: string;
};

export function generateCarImageKeys(userId: string): CarImageKeys {
  const imageId = randomBytes(16).toString("hex");
  const prefix = `cars/${userId}/${imageId}`;

  return {
    imageId,
    mainKey: `${prefix}/main.webp`,
    thumbKey: `${prefix}/thumb.webp`,
  };
}

export function getUserImageKeyPrefix(userId: string): string {
  return `cars/${userId}/`;
}

export function isUserOwnedImageKey(userId: string, key: string): boolean {
  const prefix = getUserImageKeyPrefix(userId);
  return key.startsWith(prefix) && !key.includes("..");
}
