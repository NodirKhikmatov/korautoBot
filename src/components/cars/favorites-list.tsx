"use client";

import Link from "next/link";
import { Heart, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";

import { CarImage } from "@/components/cars/car-image";
import { ListingStats } from "@/components/cars/listing-stats";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useFavorites } from "@/hooks/use-favorites";
import { formatMileage, formatPrice } from "@/lib/utils";
import type { CarWithImages } from "@/types";

function getCoverImage(car: CarWithImages): string | null {
  const sorted = [...car.carImages].sort((a, b) => a.sortOrder - b.sortOrder);
  const first = sorted[0];
  return first?.url ?? first?.thumbnailUrl ?? null;
}

export function FavoritesList() {
  const { favorites, isLoading, removeFavorite, isToggling } = useFavorites();

  if (isLoading) {
    return null;
  }

  return (
    <div className="space-y-3">
      {favorites.map((car) => (
        <FavoriteListItem
          key={car.id}
          car={car}
          onRemove={() => removeFavorite(car.id)}
          isRemoving={isToggling}
        />
      ))}
    </div>
  );
}

function FavoriteListItem({
  car,
  onRemove,
  isRemoving,
}: {
  car: CarWithImages;
  onRemove: () => void;
  isRemoving: boolean;
}) {
  const t = useTranslations("common");
  const cover = getCoverImage(car);

  return (
    <article
      className="flex gap-3 rounded-2xl border border-border/60 bg-card/50 p-3"
    >
      <Link
        href={`/car/${car.id}`}
        className="relative h-20 w-28 shrink-0 overflow-hidden rounded-xl bg-muted"
      >
        {cover ? (
          <CarImage
            src={cover}
            alt={`${car.title} — ${car.brand} ${car.model}`}
            width={112}
            height={80}
            className="h-full w-full object-contain"
            sizes="112px"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
            {t("noPhoto")}
          </div>
        )}
      </Link>

      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex items-start justify-between gap-2">
          <Link href={`/car/${car.id}`} className="min-w-0">
            <h3 className="line-clamp-1 font-semibold leading-tight">
              {car.title}
            </h3>
            <p className="text-xs text-muted-foreground">
              {car.brand} {car.model} · {car.year}
            </p>
          </Link>
        </div>

        <ListingStats
          viewCount={car.viewCount}
          contactCount={car.contactCount}
          size="xs"
        />

        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-bold">{formatPrice(car.price)}</span>
            <Badge variant="secondary" className="text-[10px]">
              {formatMileage(car.mileage)}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 gap-1 text-xs text-muted-foreground"
            onClick={onRemove}
            disabled={isRemoving}
          >
            {isRemoving ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Heart className="h-3 w-3 fill-primary text-primary" />
            )}
            {t("remove")}
          </Button>
        </div>
      </div>
    </article>
  );
}
