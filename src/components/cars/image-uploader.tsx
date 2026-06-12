"use client";

import Image from "next/image";
import { ImagePlus, Loader2, X } from "lucide-react";

import { MAX_IMAGES_PER_LISTING } from "@/lib/constants";
import { useImageUpload } from "@/hooks/use-image-upload";
import type { UploadedCarImage } from "@/types";

export function ImageUploader({
  images,
  onChange,
}: {
  images: UploadedCarImage[];
  onChange: (images: UploadedCarImage[]) => void;
}) {
  const { uploadImages, deleteImage, isUploading } = useImageUpload();

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";

    if (files.length === 0) return;

    const remaining = MAX_IMAGES_PER_LISTING - images.length;
    const toUpload = files.slice(0, remaining);

    if (toUpload.length === 0) return;

    const uploaded = await uploadImages(toUpload);
    onChange([...images, ...uploaded]);
  }

  async function handleRemove(image: UploadedCarImage) {
    try {
      await deleteImage(image.url);
    } catch {
      // Allow removal from UI even if R2 delete fails
    }
    onChange(images.filter((img) => img.imageId !== image.imageId));
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        {images.map((image) => (
          <div
            key={image.imageId}
            className="group relative aspect-square overflow-hidden rounded-xl border border-border/60 bg-muted"
          >
            <Image
              src={image.thumbnailUrl}
              alt="Uploaded"
              fill
              className="object-cover"
              sizes="120px"
            />
            <button
              type="button"
              onClick={() => handleRemove(image)}
              className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}

        {images.length < MAX_IMAGES_PER_LISTING && (
          <label
            className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-border/80 bg-card/40 transition-colors hover:border-primary/50 hover:bg-primary/5"
          >
            {isUploading ? (
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            ) : (
              <>
                <ImagePlus className="h-6 w-6 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground">Add</span>
              </>
            )}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="hidden"
              disabled={isUploading}
              onChange={handleFileSelect}
            />
          </label>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        {images.length}/{MAX_IMAGES_PER_LISTING} photos · JPEG, PNG, WebP
      </p>
    </div>
  );
}
