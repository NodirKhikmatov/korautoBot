"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { Loader2, MessageCircle, Share2 } from "lucide-react";

import { CarImageGallery } from "@/components/cars/car-image-gallery";
import { FavoriteButton } from "@/components/cars/favorite-button";
import { CarSpecs } from "@/components/cars/car-specs";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/use-auth";
import { useCar } from "@/hooks/use-car";
import { useTelegramBackButton } from "@/hooks/use-telegram-back-button";
import { getDisplayName, getTelegramContactUrl } from "@/lib/format";

export function CarDetailView({ carId }: { carId: string }) {
  const router = useRouter();
  const { data, isLoading, isError } = useCar(carId);
  const { isAuthenticated } = useAuth();

  const handleBack = useCallback(() => router.back(), [router]);
  useTelegramBackButton(handleBack);

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !data?.car) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-2 text-center">
        <p className="font-semibold">Listing not found</p>
        <Button variant="outline" onClick={() => router.push("/")}>
          Back to home
        </Button>
      </div>
    );
  }

  const car = data.car;
  const sellerName = getDisplayName(
    car.user.firstName,
    car.user.lastName,
    car.user.username,
  );
  const contactUrl = car.user.username
    ? getTelegramContactUrl(car.user.username)
    : null;

  function handleContact() {
    if (contactUrl) {
      window.Telegram?.WebApp?.openTelegramLink(contactUrl);
    }
  }

  function handleShare() {
    const url = `${window.location.origin}/car/${car.id}`;
    if (navigator.share) {
      navigator.share({ title: car.title, url });
    }
  }

  return (
    <div className="space-y-5 pb-4">
      <CarImageGallery images={car.carImages} />

      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1 min-w-0">
            <h1 className="text-xl font-bold leading-tight">{car.title}</h1>
            <p className="text-sm text-muted-foreground">
              {car.brand} {car.model} · {car.year}
            </p>
          </div>
          <div className="flex shrink-0 gap-1">
            {isAuthenticated && (
              <FavoriteButton carId={car.id} className="h-10 w-10" />
            )}
            <Button
              variant="outline"
              size="icon"
              className="rounded-xl"
              onClick={handleShare}
            >
              <Share2 className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      <CarSpecs car={car} />

      {car.description && (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold">Description</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {car.description}
          </p>
        </div>
      )}

      <Separator />

      <div className="space-y-3">
        <h2 className="text-sm font-semibold">Seller</h2>
        <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card/50 p-4">
          <Avatar
            className="h-12 w-12 text-sm"
            src={car.user.photoUrl}
            alt={sellerName}
            fallback={sellerName}
          />
          <div className="min-w-0 flex-1">
            <p className="font-medium">{sellerName}</p>
            {car.user.username && (
              <p className="text-sm text-muted-foreground">
                @{car.user.username}
              </p>
            )}
          </div>
        </div>

        {contactUrl && (
          <Button
            size="lg"
            className="h-12 w-full rounded-xl text-base font-semibold"
            onClick={handleContact}
          >
            <MessageCircle className="h-5 w-5" />
            Contact on Telegram
          </Button>
        )}
      </div>
    </div>
  );
}
