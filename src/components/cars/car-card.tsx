"use client";

import Link from "next/link";
import { Calendar, Gauge, MapPin } from "lucide-react";

import { CarImage } from "@/components/cars/car-image";
import { FavoriteButton } from "@/components/cars/favorite-button";
import { Badge } from "@/components/ui/badge";
import { formatMileage, formatPrice } from "@/lib/utils";
import type { CarWithImages } from "@/types";

function getCoverImage(car: CarWithImages): string | null {
  const sorted = [...car.carImages].sort((a, b) => a.sortOrder - b.sortOrder);
  const first = sorted[0];
  return first?.thumbnailUrl ?? first?.url ?? null;
}

export function CarCard({
  car,
  priority = false,
}: {
  car: CarWithImages;
  priority?: boolean;
}) {
  const cover = getCoverImage(car);
  const coverAlt = `${car.title} — ${car.brand} ${car.model} ${car.year}`;

  return (
    <Link href={`/car/${car.id}`} className="group block">
      <article
        className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm transition-all duration-300 group-hover:border-primary/30 group-hover:shadow-md group-active:scale-[0.98]"
      >
        <div className="relative aspect-[16/10] overflow-hidden bg-muted">
          {cover ? (
            <CarImage
              src={cover}
              alt={coverAlt}
              width={640}
              height={400}
              priority={priority}
              className="h-full w-full object-cover"
              sizes="(max-width: 768px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-muted to-muted/50">
              <CarPlaceholderIcon />
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="absolute right-2 top-2">
            <FavoriteButton
              carId={car.id}
              className="h-8 w-8 border-0 bg-black/40 text-white backdrop-blur-sm hover:bg-black/60 hover:text-white"
              variant="ghost"
            />
          </div>
          <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2">
            <Badge
              className="border-0 bg-black/50 text-white backdrop-blur-sm"
              variant="secondary"
            >
              {car.brand}
            </Badge>
            <span className="text-sm font-bold text-white drop-shadow">
              {formatPrice(car.price)}
            </span>
          </div>
        </div>

        <div className="space-y-2 p-3">
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
