import { ALLOWED_IMAGE_TYPES } from "@/lib/constants";
import { ImageUploadError } from "@/lib/images/errors";
import { MAX_UPLOAD_FILE_SIZE_BYTES } from "@/lib/images/constants";

export function validateUploadFile(
  buffer: Buffer,
  contentType: string | null,
): void {
  if (buffer.length === 0) {
    throw new ImageUploadError("Empty file");
  }

  if (buffer.length > MAX_UPLOAD_FILE_SIZE_BYTES) {
    throw new ImageUploadError(
      `File exceeds maximum size of ${MAX_UPLOAD_FILE_SIZE_BYTES} bytes`,
    );
  }

  if (
    !contentType ||
    !ALLOWED_IMAGE_TYPES.includes(
      contentType as typeof ALLOWED_IMAGE_TYPES[number],
    )
  ) {
    throw new ImageUploadError(
      "Invalid file type. Allowed: JPEG, PNG, WebP",
    );
  }
}
