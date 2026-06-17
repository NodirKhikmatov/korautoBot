"use client";

import { useMutation } from "@tanstack/react-query";

import { MAX_IMAGES_PER_LISTING } from "@/lib/constants";
import type { UploadedCarImage } from "@/types";

type UploadImagesResponse = {
  images: UploadedCarImage[];
};

export type UploadErrorCode =
  | "noFilesSelected"
  | "maxImagesAllowed"
  | "uploadFailed";

export class UploadError extends Error {
  constructor(public code: UploadErrorCode) {
    super(code);
    this.name = "UploadError";
  }
}

async function parseError(response: Response): Promise<string> {
  const data = (await response.json().catch(() => null)) as
    | { error?: string }
    | null;
  return data?.error ?? "uploadFailed";
}

export function useImageUpload() {
  const uploadMutation = useMutation({
    mutationFn: async (files: File[]): Promise<UploadedCarImage[]> => {
      if (files.length === 0) {
        throw new UploadError("noFilesSelected");
      }

      if (files.length > MAX_IMAGES_PER_LISTING) {
        throw new UploadError("maxImagesAllowed");
      }

      const formData = new FormData();
      for (const file of files) {
        formData.append("files", file);
      }

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        const message = await parseError(response);
        if (message === "uploadFailed") {
          throw new UploadError("uploadFailed");
        }
        throw new Error(message);
      }

      const data = (await response.json()) as UploadImagesResponse;
      return data.images;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (url: string): Promise<void> => {
      const response = await fetch("/api/upload", {
        method: "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        const message = await parseError(response);
        if (message === "uploadFailed") {
          throw new UploadError("uploadFailed");
        }
        throw new Error(message);
      }
    },
  });

  return {
    uploadImages: uploadMutation.mutateAsync,
    deleteImage: deleteMutation.mutateAsync,
    isUploading: uploadMutation.isPending,
    isDeleting: deleteMutation.isPending,
    uploadError: uploadMutation.error,
    deleteError: deleteMutation.error,
  };
}
