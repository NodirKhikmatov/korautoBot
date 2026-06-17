"use client";

import { Heart, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useFavorites } from "@/hooks/use-favorites";
import { cn } from "@/lib/utils";

export function FavoriteButton({
  carId,
  className,
  size = "icon",
  variant = "outline",
}: {
  carId: string;
  className?: string;
  size?: "icon" | "sm";
  variant?: "outline" | "ghost";
}) {
  const t = useTranslations("favorites");
  const { isAuthenticated } = useAuth();
  const { isFavorite, toggleFavorite, isToggling } = useFavorites(isAuthenticated);

  if (!isAuthenticated) {
    return null;
  }

  const favorited = isFavorite(carId);

  async function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    await toggleFavorite(carId);
    window.Telegram?.WebApp?.HapticFeedback?.impactOccurred("light");
  }

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={cn(
        "rounded-xl shrink-0",
        size === "icon" && "h-8 w-8",
        favorited && "border-primary/40 bg-primary/10",
        className,
      )}
      onClick={handleClick}
      disabled={isToggling}
      aria-label={
        favorited ? t("removeFromFavorites") : t("addToFavorites")
      }
    >
      {isToggling ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Heart
          className={cn(
            "h-4 w-4",
            favorited && "fill-primary text-primary",
          )}
        />
      )}
    </Button>
  );
}
