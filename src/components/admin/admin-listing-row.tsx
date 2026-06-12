"use client";

import Link from "next/link";
import Image from "next/image";
import { Pencil, Sparkles, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getDisplayName } from "@/lib/format";
import { formatPrice } from "@/lib/utils";
import type { AdminCarListItem } from "@/services/admin";

export function AdminListingRow({
  car,
  onFeature,
  onDelete,
  isFeaturing,
  isDeleting,
}: {
  car: AdminCarListItem;
  onFeature: (carId: string, isFeatured: boolean) => void;
  onDelete: (carId: string) => void;
  isFeaturing?: boolean;
  isDeleting?: boolean;
}) {
  const cover = car.carImages[0];
  const sellerName = getDisplayName(
    car.user.firstName,
    car.user.lastName,
    car.user.username,
  );

  return (
    <div className="rounded-2xl border border-border/60 bg-card/50 p-3">
      <div className="flex gap-3">
        <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-xl bg-muted">
          {cover ? (
            <Image
              src={cover.thumbnailUrl ?? cover.url}
              alt={car.title}
              fill
              className="object-cover"
              sizes="96px"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
              No photo
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-1.5">
            {car.isFeatured && (
              <Badge className="rounded-md px-1.5 py-0 text-[10px]">
                Featured
              </Badge>
            )}
            {!car.isActive && (
              <Badge variant="secondary" className="rounded-md px-1.5 py-0 text-[10px]">
                Hidden
              </Badge>
            )}
          </div>
          <p className="truncate font-semibold leading-tight">{car.title}</p>
          <p className="text-sm font-medium text-primary">
            {formatPrice(car.price)}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {sellerName}
            {car.user.username ? ` · @${car.user.username}` : ""}
          </p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        <Button
          asChild
          variant="outline"
          size="sm"
          className="h-9 rounded-xl"
        >
          <Link href={`/admin/listings/${car.id}`}>
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </Link>
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-9 rounded-xl"
          disabled={isFeaturing}
          onClick={() => onFeature(car.id, !car.isFeatured)}
        >
          <Sparkles className="h-3.5 w-3.5" />
          {car.isFeatured ? "Unfeature" : "Feature"}
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-9 rounded-xl text-destructive hover:text-destructive"
          disabled={isDeleting}
          onClick={() => onDelete(car.id)}
        >
          <Trash2 className="h-3.5 w-3.5" />
          Delete
        </Button>
      </div>
    </div>
  );
}
