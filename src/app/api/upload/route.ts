import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth/get-current-user";
import {
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_SIZE_BYTES,
} from "@/lib/constants";
import {
  createUploadUrl,
  generateImageKey,
  getPublicImageUrl,
} from "@/lib/r2/client";
import { z } from "zod";

const uploadRequestSchema = z.object({
  filename: z.string().min(1),
  contentType: z.enum(ALLOWED_IMAGE_TYPES),
  contentLength: z.number().int().positive().max(MAX_IMAGE_SIZE_BYTES),
});

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to create upload URL" },
      { status: 500 },
    );
  }
}
