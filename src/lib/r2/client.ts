import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

import { WEBP_CONTENT_TYPE } from "@/lib/images/constants";
import { toR2UploadError } from "@/lib/r2/errors";

function assertR2PublicUrl(publicUrl: string): void {
  try {
    const hostname = new URL(publicUrl).hostname;

    if (
      hostname === "dash.cloudflare.com" ||
      hostname.endsWith(".cloudflare.com")
    ) {
      throw new Error(
        "R2_PUBLIC_URL must be the bucket public URL (https://pub-xxxx.r2.dev), not the Cloudflare dashboard",
      );
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes("R2_PUBLIC_URL")) {
      throw error;
    }

    throw new Error("R2_PUBLIC_URL is not a valid URL");
  }
}

function getR2Config() {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucketName = process.env.R2_BUCKET_NAME;
  const publicUrl = process.env.R2_PUBLIC_URL;

  if (
    !accountId ||
    !accessKeyId ||
    !secretAccessKey ||
    !bucketName ||
    !publicUrl
  ) {
    throw new Error("R2 environment variables are not configured");
  }

  assertR2PublicUrl(publicUrl);

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
  const base = publicUrl.replace(/\/$/, "");
  return `${base}/${key}`;
}

export async function uploadObject(
  key: string,
  body: Buffer,
  contentType = WEBP_CONTENT_TYPE,
): Promise<void> {
  const { bucketName } = getR2Config();
  const client = createR2Client();

  try {
    await client.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: body,
        ContentType: contentType,
        CacheControl: "public, max-age=31536000, immutable",
      }),
    );
  } catch (error) {
    throw toR2UploadError(error);
  }
}

export async function deleteObject(key: string): Promise<void> {
  const { bucketName } = getR2Config();
  const client = createR2Client();

  await client.send(
    new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    }),
  );
}

export async function deleteObjects(keys: string[]): Promise<void> {
  await Promise.all(keys.map((key) => deleteObject(key)));
}
