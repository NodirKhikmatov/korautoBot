"use client";

import { CheckCircle2, Loader2, RotateCcw } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { useUpdateListingStatus } from "@/hooks/use-update-listing-status";
import { isListingSold } from "@/lib/listing/status";
import type { Car } from "@/types";

export function ListingOwnerActions({
  car,
  className,
}: {
  car: Car;
  className?: string;
}) {
  const t = useTranslations("listing");
  const updateStatus = useUpdateListingStatus(car.id);
  const [error, setError] = useState<string | null>(null);
  const sold = isListingSold(car);

  async function handleMarkSold() {
    setError(null);
    try {
      await updateStatus.mutateAsync({ status: "sold" });
    } catch (err) {
      setError(err instanceof Error ? err.message : t("statusUpdateFailed"));
    }
  }

  async function handleRelist() {
    setError(null);
    try {
      await updateStatus.mutateAsync({ status: "active" });
    } catch (err) {
      setError(err instanceof Error ? err.message : t("statusUpdateFailed"));
    }
  }

  return (
    <div className={className}>
      {sold ? (
        <Button
          type="button"
          variant="outline"
          className="w-full rounded-xl"
          onClick={handleRelist}
          disabled={updateStatus.isPending}
        >
          {updateStatus.isPending ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <RotateCcw className="h-5 w-5" />
          )}
          {t("relist")}
        </Button>
      ) : (
        <Button
          type="button"
          variant="outline"
          className="w-full rounded-xl"
          onClick={handleMarkSold}
          disabled={updateStatus.isPending}
        >
          {updateStatus.isPending ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <CheckCircle2 className="h-5 w-5" />
          )}
          {t("markSold")}
        </Button>
      )}

      {error && (
        <p className="mt-2 text-center text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}
