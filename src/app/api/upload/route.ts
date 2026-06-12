import { NextResponse } from "next/server";
import { z } from "zod";

import { handleAuthRouteError } from "@/lib/auth/handle-auth-route-error";
import { requireAuth } from "@/lib/auth/require-auth";
import {
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_SIZE_BYTES,
} from "@/lib/constants";
import {
  createUploadUrl,
  generateImageKey,
  getPublicImageUrl,
} from "@/lib/r2/client";

const uploadRequestSchema = z.object({
  filename: z.string().min(1),
  contentType: z.enum(ALLOWED_IMAGE_TYPES),
  contentLength: z.number().int().positive().max(MAX_IMAGE_SIZE_BYTES),
});

export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const { filename, contentType } = uploadRequestSchema.parse(body);

    const key = generateImageKey(user.id, filename);
    const uploadUrl = await createUploadUrl(key, contentType);
    const publicUrl = getPublicImageUrl(key);

    return NextResponse.json({
      uploadUrl,
      publicUrl,
      key,
    });
  } catch (error) {
    return handleAuthRouteError(error, "Upload error");
  }
}
