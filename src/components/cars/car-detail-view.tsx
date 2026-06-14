"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Share2 } from "lucide-react";
import { useTranslations } from "next-intl";

import { CarImageGallery } from "@/components/cars/car-image-gallery";
import { FavoriteButton } from "@/components/cars/favorite-button";
import { ListingOwnerActions } from "@/components/cars/listing-owner-actions";
import { ListingStats } from "@/components/cars/listing-stats";
import { SoldBadge } from "@/components/cars/sold-badge";
import { CarSpecs } from "@/components/cars/car-specs";
import { ContactSellerButton } from "@/components/seller/contact-seller-button";
import { SellerProfileCard } from "@/components/seller/seller-profile-card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/use-auth";
import { useCar } from "@/hooks/use-car";
import { useRecordCarView } from "@/hooks/use-record-car-view";
import { useTelegramBackButton } from "@/hooks/use-telegram-back-button";
import { isListingSold } from "@/lib/listing/status";

export function CarDetailView({ carId }: { carId: string }) {
  const t = useTranslations("listing");
  const tCommon = useTranslations("common");
  const tSeller = useTranslations("seller");
  const router = useRouter();
  const { data, isLoading, isError } = useCar(carId);
  const { isAuthenticated, user } = useAuth();
  const car = data?.car;

  useRecordCarView(carId, car?.userId);

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
        <p className="font-semibold">{t("notFound")}</p>
        <Button variant="outline" onClick={() => router.push("/")}>
          {tCommon("backToHome")}
        </Button>
      </div>
    );
  }

  const listing = data.car;
  const isOwner = isAuthenticated && user?.id === listing.userId;
  const sold = isListingSold(listing);

  function handleShare() {
    const url = `${window.location.origin}/car/${listing.id}`;
    if (navigator.share) {
      navigator.share({ title: listing.title, url });
    }
  }

  return (
    <div className="space-y-5 pb-4">
      <CarImageGallery images={listing.carImages} carTitle={listing.title} />

      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1 min-w-0">
            <h1 className="text-xl font-bold leading-tight">{listing.title}</h1>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm text-muted-foreground">
                {listing.brand} {listing.model} · {listing.year}
              </p>
              <SoldBadge car={listing} />
            </div>
            <ListingStats
              viewCount={listing.viewCount}
              contactCount={listing.contactCount}
              className="pt-1"
            />
          </div>
          <div className="flex shrink-0 gap-1">
            {isAuthenticated && !sold && (
              <FavoriteButton carId={listing.id} className="h-10 w-10" />
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

      <CarSpecs car={listing} />

      {listing.description && (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold">{t("description")}</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {listing.description}
          </p>
        </div>
      )}

      {sold && (
        <p className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {isOwner ? t("soldDescriptionOwner") : t("soldDescription")}
        </p>
      )}

      <Separator />

      {isOwner && (
        <ListingOwnerActions car={listing} className="space-y-2" />
      )}

      {!sold && (
        <>
          <div className="space-y-3">
            <h2 className="text-sm font-semibold">{tSeller("title")}</h2>
            <SellerProfileCard seller={listing.user} />
            <ContactSellerButton
              carId={listing.id}
              carTitle={listing.title}
              username={listing.user.username}
              phone={listing.user.phone}
            />
          </div>
        </>
      )}
    </div>
  );
}
