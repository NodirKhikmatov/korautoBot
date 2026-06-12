"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import { CarImage as CarImageView } from "@/components/cars/car-image";
import { cn } from "@/lib/utils";
import type { CarImage } from "@/types";

export function CarImageGallery({
  images,
  carTitle,
}: {
  images: CarImage[];
  carTitle?: string;
}) {
  const t = useTranslations("listing");
  const sorted = [...images].sort((a, b) => a.sortOrder - b.sortOrder);
  const [activeIndex, setActiveIndex] = useState(0);

  if (sorted.length === 0) {
    return (
      <div className="aspect-[16/10] flex items-center justify-center rounded-2xl bg-muted">
        <span className="text-sm text-muted-foreground">{t("noPhotos")}</span>
      </div>
    );
  }

  const active = sorted[activeIndex] ?? sorted[0]!;

  return (
    <div className="space-y-3">
      <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-muted">
        <CarImageView
          src={active.url}
          alt={
            carTitle
              ? t("photoAlt", {
                  title: carTitle,
                  index: activeIndex + 1,
                  total: sorted.length,
                })
              : t("carPhotoAlt", {
                  index: activeIndex + 1,
                  total: sorted.length,
                })
          }
          width={1280}
          height={800}
          className="h-full w-full object-cover"
          sizes="100vw"
          priority
        />
        {sorted.length > 1 && (
          <div className="absolute bottom-3 right-3 rounded-full bg-foreground/50 px-2.5 py-1 text-xs font-medium text-background backdrop-blur-sm">
            {activeIndex + 1} / {sorted.length}
          </div>
        )}
      </div>

      {sorted.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {sorted.map((image, index) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={cn(
                "relative h-16 w-24 shrink-0 overflow-hidden rounded-xl border-2 transition-all touch-manipulation",
                index === activeIndex
                  ? "border-primary ring-2 ring-primary/30"
                  : "border-transparent opacity-70 hover:opacity-100",
              )}
            >
              <CarImageView
                src={image.thumbnailUrl}
                alt={
                  carTitle
                    ? t("thumbnailAlt", {
                        title: carTitle,
                        index: index + 1,
                      })
                    : t("carThumbnailAlt", { index: index + 1 })
                }
                width={96}
                height={64}
                className="h-full w-full object-cover"
                sizes="96px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
