import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import {
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_SIZE_BYTES,
} from "@/lib/constants";

function getR2Config() {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucketName = process.env.R2_BUCKET_NAME;
  const publicUrl = process.env.R2_PUBLIC_URL;

  if (!accountId || !accessKeyId || !secretAccessKey || !bucketName || !publicUrl) {
    throw new Error("R2 environment variables are not configured");
  }

  return {
    accountId,
    accessKeyId,
    secretAccessKey,
    bucketName,
    publicUrl,
  };
}

export function createR2Client() {
  const { accountId, accessKeyId, secretAccessKey } = getR2Config();

  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
}

export function getPublicImageUrl(key: string): string {
  const { publicUrl } = getR2Config();
  return `${publicUrl}/${key}`;
}

export function generateImageKey(userId: string, filename: string): string {
  const extension = filename.split(".").pop() ?? "jpg";
  const timestamp = Date.now();
  const random = Math.random().toString(36).slice(2, 10);
  return `cars/${userId}/${timestamp}-${random}.${extension}`;
}

export async function createUploadUrl(
  key: string,
  contentType: string,
): Promise<string> {
  if (!ALLOWED_IMAGE_TYPES.includes(contentType as typeof ALLOWED_IMAGE_TYPES[number])) {
    throw new Error("Invalid image type");
  }

  const { bucketName } = getR2Config();
  const client = createR2Client();

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    ContentType: contentType,
    ContentLength: MAX_IMAGE_SIZE_BYTES,
  });

  return getSignedUrl(client, command, { expiresIn: 300 });
}

export async function deleteImage(key: string): Promise<void> {
  const { bucketName } = getR2Config();
  const client = createR2Client();

  await client.send(
    new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    }),
  );
}
