"use client";

import { useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
import { isListingSold } from "@/lib/listing/status";
import type { Car } from "@/types";
import { cn } from "@/lib/utils";

export function SoldBadge({
  car,
  className,
}: {
  car: Pick<Car, "soldAt" | "isActive">;
  className?: string;
}) {
  const t = useTranslations("listing");

  if (!isListingSold(car)) {
    return null;
  }

  return (
    <Badge
      variant="secondary"
      className={cn(
        "border-destructive/20 bg-destructive/10 text-destructive",
        className,
      )}
    >
      {t("sold")}
    </Badge>
  );
}
