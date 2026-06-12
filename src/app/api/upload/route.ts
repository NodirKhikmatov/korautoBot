import { NextResponse } from "next/server";
import { z } from "zod";

import { handleRouteError } from "@/lib/api/handle-route-error";
import { requireAuth } from "@/lib/auth/require-auth";
import { MAX_IMAGES_PER_LISTING } from "@/lib/constants";
import { ImageUploadError } from "@/lib/images/errors";
import {
  deleteCarImageByUrl,
  uploadCarImages,
} from "@/services/image-upload";

export const runtime = "nodejs";

const deleteImageSchema = z.object({
  url: z.string().url(),
});

async function readUploadFiles(
  formData: FormData,
): Promise<Array<{ buffer: Buffer; contentType: string | null }>> {
  const entries = [...formData.getAll("files"), ...formData.getAll("file")];

  const files = entries.filter((entry): entry is File => entry instanceof File);

  if (files.length === 0) {
    throw new ImageUploadError("No image files provided");
  }

  if (files.length > MAX_IMAGES_PER_LISTING) {
    throw new ImageUploadError(
      `Maximum ${MAX_IMAGES_PER_LISTING} images per request`,
    );
  }

  return Promise.all(
    files.map(async (file) => ({
      buffer: Buffer.from(await file.arrayBuffer()),
      contentType: file.type || null,
    })),
  );
}

export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    const formData = await request.formData();
    const files = await readUploadFiles(formData);
    const images = await uploadCarImages(user.id, files);

    return NextResponse.json({ images }, { status: 201 });
  } catch (error) {
    return handleRouteError(error, "Upload error", "Failed to upload image");
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const { url } = deleteImageSchema.parse(body);

    await deleteCarImageByUrl(user.id, url);

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleRouteError(error, "Delete image error", "Failed to delete image");
  }
}
