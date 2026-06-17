import { MAX_IMAGES_PER_LISTING } from "@/lib/constants";
import { ImageUploadError } from "@/lib/images/errors";
import { processImageBuffer } from "@/lib/images/process";
import { validateUploadFile } from "@/lib/images/validate";
import {
  deleteObjects,
  getPublicImageUrl,
  uploadObject,
} from "@/lib/r2/client";
import {
  generateCarImageKeys,
  getUserImageKeyPrefix,
  isUserOwnedImageKey,
} from "@/lib/r2/keys";
import type { UploadedCarImage } from "@/types";

function getR2PublicBaseUrl(): string {
  const publicUrl = process.env.R2_PUBLIC_URL;

  if (!publicUrl) {
    throw new ImageUploadError("R2 is not configured", 500);
  }

  try {
    const hostname = new URL(publicUrl).hostname;

    if (
      hostname === "dash.cloudflare.com" ||
      hostname.endsWith(".cloudflare.com")
    ) {
      throw new ImageUploadError(
        "R2_PUBLIC_URL must be https://pub-xxxx.r2.dev (bucket public URL), not the Cloudflare dashboard",
        500,
      );
    }
  } catch (error) {
    if (error instanceof ImageUploadError) {
      throw error;
    }

    throw new ImageUploadError("R2_PUBLIC_URL is not a valid URL", 500);
  }

  return publicUrl.replace(/\/$/, "");
}

export function extractKeyFromPublicUrl(url: string): string | null {
  const base = getR2PublicBaseUrl();

  if (!url.startsWith(`${base}/`)) {
    return null;
  }

  const key = url.slice(base.length + 1);
  return key.length > 0 ? key : null;
}

export function validateUserImageUrl(userId: string, url: string): boolean {
  const key = extractKeyFromPublicUrl(url);

  if (!key) {
    return false;
  }

  return isUserOwnedImageKey(userId, key);
}

export function validateUserImagePair(
  userId: string,
  url: string,
  thumbnailUrl: string,
): void {
  if (!validateUserImageUrl(userId, url)) {
    throw new ImageUploadError("Invalid image URL for this user");
  }

  if (!validateUserImageUrl(userId, thumbnailUrl)) {
    throw new ImageUploadError("Invalid thumbnail URL for this user");
  }

  const mainKey = extractKeyFromPublicUrl(url);
  const thumbKey = extractKeyFromPublicUrl(thumbnailUrl);

  if (!mainKey?.endsWith("/main.webp") || !thumbKey?.endsWith("/thumb.webp")) {
    throw new ImageUploadError("Image URL format is invalid");
  }

  const imageIdFromMain = mainKey.split("/").at(-2);
  const imageIdFromThumb = thumbKey.split("/").at(-2);

  if (!imageIdFromMain || imageIdFromMain !== imageIdFromThumb) {
    throw new ImageUploadError("Image and thumbnail do not match");
  }
}

export async function uploadCarImage(
  userId: string,
  buffer: Buffer,
  contentType: string | null,
): Promise<UploadedCarImage> {
  validateUploadFile(buffer, contentType);

  const processed = await processImageBuffer(buffer);
  const keys = generateCarImageKeys(userId);

  await Promise.all([
    uploadObject(keys.mainKey, processed.main),
    uploadObject(keys.thumbKey, processed.thumbnail),
  ]);

  return {
    imageId: keys.imageId,
    url: getPublicImageUrl(keys.mainKey),
    thumbnailUrl: getPublicImageUrl(keys.thumbKey),
    key: keys.mainKey,
    thumbnailKey: keys.thumbKey,
    width: processed.width,
    height: processed.height,
  };
}

export async function uploadCarImages(
  userId: string,
  files: Array<{ buffer: Buffer; contentType: string | null }>,
): Promise<UploadedCarImage[]> {
  if (files.length === 0) {
    throw new ImageUploadError("No files provided");
  }

  if (files.length > MAX_IMAGES_PER_LISTING) {
    throw new ImageUploadError(
      `Maximum ${MAX_IMAGES_PER_LISTING} images allowed per upload`,
    );
  }

  return Promise.all(
    files.map((file) =>
      uploadCarImage(userId, file.buffer, file.contentType),
    ),
  );
}

export async function deleteCarImageByKeys(
  userId: string,
  mainKey: string,
  thumbKey: string,
): Promise<void> {
  if (
    !isUserOwnedImageKey(userId, mainKey) ||
    !isUserOwnedImageKey(userId, thumbKey)
  ) {
    throw new ImageUploadError("Cannot delete image owned by another user");
  }

  await deleteObjects([mainKey, thumbKey]);
}

export async function deleteCarImageByUrl(
  userId: string,
  url: string,
): Promise<void> {
  const mainKey = extractKeyFromPublicUrl(url);

  if (!mainKey || !isUserOwnedImageKey(userId, mainKey)) {
    throw new ImageUploadError("Invalid image URL for this user");
  }

  const thumbKey = mainKey.replace(/\/main\.webp$/, "/thumb.webp");

  if (!isUserOwnedImageKey(userId, thumbKey)) {
    throw new ImageUploadError("Invalid thumbnail key for this user");
  }

  await deleteObjects([mainKey, thumbKey]);
}

export function getUserCarImagesPrefix(userId: string): string {
  return getUserImageKeyPrefix(userId);
}
