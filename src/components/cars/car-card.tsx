"use client";

import Link from "next/link";
import { Calendar, Gauge, MapPin } from "lucide-react";

import { CarImage } from "@/components/cars/car-image";
import { ListingStats } from "@/components/cars/listing-stats";
import { SoldBadge } from "@/components/cars/sold-badge";
import { FavoriteButton } from "@/components/cars/favorite-button";
import { Badge } from "@/components/ui/badge";
import { formatMileage, formatPrice } from "@/lib/utils";
import { isListingSold } from "@/lib/listing/status";
import type { CarWithImages } from "@/types";

function getCoverImage(car: CarWithImages): string | null {
  const sorted = [...car.carImages].sort((a, b) => a.sortOrder - b.sortOrder);
  const first = sorted[0];
  // Grid cards render small (≤400px); prefer the lightweight thumbnail.
  return first?.thumbnailUrl ?? first?.url ?? null;
}

export function CarCard({
  car,
  priority = false,
  showStats = true,
}: {
  car: CarWithImages;
  priority?: boolean;
  showStats?: boolean;
}) {
  const cover = getCoverImage(car);
  const coverAlt = `${car.title} — ${car.brand} ${car.model} ${car.year}`;
  const sold = isListingSold(car);

  return (
    <Link href={`/car/${car.id}`} className="group block">
      <article
        className={`overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm transition-all duration-300 group-hover:border-primary/30 group-hover:shadow-md group-active:scale-[0.98] ${sold ? "opacity-80" : ""}`}
      >
        <div className="relative aspect-[16/10] overflow-hidden bg-muted">
          {cover ? (
            <CarImage
              src={cover}
              alt={coverAlt}
              width={640}
              height={400}
              priority={priority}
              className={`h-full w-full object-contain ${sold ? "grayscale-[35%]" : ""}`}
              sizes="(max-width: 768px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-muted to-muted/50">
              <CarPlaceholderIcon />
            </div>
          )}
          {sold && (
            <div className="absolute left-2 top-2">
              <SoldBadge car={car} />
            </div>
          )}
          <div className="absolute right-2 top-2">
            {!sold && (
              <FavoriteButton
                carId={car.id}
                className="h-8 w-8 border-0 bg-foreground/40 text-background backdrop-blur-sm hover:bg-foreground/60"
                variant="ghost"
              />
            )}
          </div>
        </div>

        <div className="space-y-2 p-3">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-bold tabular-nums leading-tight text-primary">
              {formatPrice(car.price)}
            </p>
            <Badge variant="secondary" className="shrink-0 text-[10px]">
              {car.brand}
            </Badge>
          </div>
          <h3 className="line-clamp-1 font-semibold leading-tight">
            {car.title}
          </h3>
          <p className="line-clamp-1 text-xs text-muted-foreground">
            {car.model} · {car.year}
          </p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {car.year}
            </span>
            <span className="inline-flex items-center gap-1">
              <Gauge className="h-3 w-3" />
              {formatMileage(car.mileage)}
            </span>
            {car.location && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {car.location}
              </span>
            )}
          </div>
          {showStats && (
            <ListingStats
              viewCount={car.viewCount}
              contactCount={car.contactCount}
              size="xs"
            />
          )}
        </div>
      </article>
    </Link>
  );
}

function CarPlaceholderIcon() {
  return (
    <svg
      className="h-12 w-12 text-muted-foreground/40"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path
        d="M5 17h14v-2.5a1 1 0 0 0-.3-.7l-2.4-2.4A1 1 0 0 0 16.1 14H7.9a1 1 0 0 0-.7.3l-2.4 2.4a1 1 0 0 0-.3.7V17z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M7 14l1.5-4h9L18 14" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="7.5" cy="17" r="1.5" />
      <circle cx="16.5" cy="17" r="1.5" />
    </svg>
  );
}
