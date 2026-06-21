"use client";

import { Shield } from "lucide-react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";

import {
  InsuranceCalculator,
  type InsurancePrefill,
} from "@/components/tools/insurance-calculator";
import { PageHeader } from "@/components/layout/page-header";

function parsePositiveInt(value: string | null): number | undefined {
  if (!value) return undefined;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) return undefined;
  return Math.round(parsed);
}

function parsePrefillFromSearchParams(
  searchParams: URLSearchParams,
): InsurancePrefill | undefined {
  const vehiclePrice = parsePositiveInt(searchParams.get("price"));
  const year = parsePositiveInt(searchParams.get("year"));
  const mileage = parsePositiveInt(searchParams.get("mileage"));

  if (
    vehiclePrice === undefined &&
    year === undefined &&
    mileage === undefined
  ) {
    return undefined;
  }

  return {
    ...(vehiclePrice !== undefined ? { vehiclePrice } : {}),
    ...(year !== undefined ? { year } : {}),
    ...(mileage !== undefined ? { mileage } : {}),
  };
}

export function InsurancePageClient() {
  const t = useTranslations("insurance");
  const searchParams = useSearchParams();

  const prefill = useMemo(
    () => parsePrefillFromSearchParams(searchParams),
    [searchParams],
  );

  return (
    <div className="space-y-6 pb-4">
      <PageHeader
        title={t("title")}
        subtitle={t("subtitle")}
      />
      <div className="flex items-start gap-3 rounded-2xl border border-border/60 bg-card/60 p-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15">
          <Shield className="h-5 w-5 text-primary" />
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {t("intro")}
        </p>
      </div>
      <InsuranceCalculator prefill={prefill} />
    </div>
  );
}
