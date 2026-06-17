import {
  ALLOWED_IMAGE_TYPES,
  type AllowedImageType,
} from "@/lib/constants";
import { MAX_UPLOAD_FILE_SIZE_BYTES } from "@/lib/images/constants";
import { detectImageMimeType } from "@/lib/images/detect-mime";
import { ImageUploadError } from "@/lib/images/errors";

function normalizeContentType(contentType: string | null): string | null {
  if (!contentType) {
    return null;
  }

  const normalized = contentType.toLowerCase().split(";")[0]?.trim();
  return normalized || null;
}

function resolveImageMimeType(
  buffer: Buffer,
  contentType: string | null,
): AllowedImageType {
  const normalized = normalizeContentType(contentType);

  if (
    normalized &&
    ALLOWED_IMAGE_TYPES.includes(normalized as AllowedImageType)
  ) {
    return normalized as AllowedImageType;
  }

  const detected = detectImageMimeType(buffer);

  if (detected) {
    return detected;
  }

  throw new ImageUploadError("Invalid file type. Allowed: JPEG, PNG, WebP");
}

export function validateUploadFile(
  buffer: Buffer,
  contentType: string | null,
): AllowedImageType {
  if (buffer.length === 0) {
    throw new ImageUploadError("Empty file");
  }

  if (buffer.length > MAX_UPLOAD_FILE_SIZE_BYTES) {
    throw new ImageUploadError(
      `File exceeds maximum size of ${MAX_UPLOAD_FILE_SIZE_BYTES} bytes`,
    );
  }

  return resolveImageMimeType(buffer, contentType);
}
