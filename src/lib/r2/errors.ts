import { ImageUploadError } from "@/lib/images/errors";

export function toR2UploadError(error: unknown): ImageUploadError {
  const name =
    error && typeof error === "object" && "name" in error
      ? String(error.name)
      : "";
  const message =
    error && typeof error === "object" && "message" in error
      ? String(error.message)
      : "";

  if (name === "NoSuchBucket" || message.includes("bucket does not exist")) {
    return new ImageUploadError(
      "R2 bucket not found. Create the bucket in Cloudflare and set R2_BUCKET_NAME.",
      500,
    );
  }

  if (
    name === "InvalidAccessKeyId" ||
    name === "SignatureDoesNotMatch" ||
    message.includes("credentials")
  ) {
    return new ImageUploadError(
      "R2 credentials are invalid. Check R2_ACCESS_KEY_ID and R2_SECRET_ACCESS_KEY.",
      500,
    );
  }

  if (message.includes("R2 environment variables are not configured")) {
    return new ImageUploadError("R2 is not configured on the server", 500);
  }

  if (message.includes("R2_PUBLIC_URL")) {
    return new ImageUploadError(message, 500);
  }

  return new ImageUploadError("Failed to upload image to storage", 500);
}
