import sharp from "sharp";

import {
  IMAGE_MAIN_MAX_WIDTH,
  IMAGE_MAIN_QUALITY,
  IMAGE_THUMB_QUALITY,
  IMAGE_THUMB_WIDTH,
} from "@/lib/images/constants";
import { ImageUploadError } from "@/lib/images/errors";

export type ProcessedImage = {
  main: Buffer;
  thumbnail: Buffer;
  width: number;
  height: number;
};

const MAX_PIXELS = 25_000_000;

export async function processImageBuffer(
  input: Buffer,
): Promise<ProcessedImage> {
  try {
    const image = sharp(input, { failOn: "error" });
    const metadata = await image.metadata();

    if (!metadata.width || !metadata.height) {
      throw new ImageUploadError("Invalid image dimensions");
    }

    if (metadata.width * metadata.height > MAX_PIXELS) {
      throw new ImageUploadError("Image resolution is too large");
    }

    const main = await sharp(input, { failOn: "error" })
      .rotate()
      .resize({
        width: IMAGE_MAIN_MAX_WIDTH,
        height: IMAGE_MAIN_MAX_WIDTH,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: IMAGE_MAIN_QUALITY, effort: 4 })
      .toBuffer();

    const thumbnail = await sharp(input, { failOn: "error" })
      .rotate()
      .resize({
        width: IMAGE_THUMB_WIDTH,
        height: IMAGE_THUMB_WIDTH,
        fit: "cover",
        position: "centre",
      })
      .webp({ quality: IMAGE_THUMB_QUALITY, effort: 4 })
      .toBuffer();

    return {
      main,
      thumbnail,
      width: metadata.width,
      height: metadata.height,
    };
  } catch (error) {
    if (error instanceof ImageUploadError) {
      throw error;
    }

    throw new ImageUploadError("Failed to process image");
  }
}
