"use client";

import { Calculator, Shield } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { calculateInsurancePremium } from "@/lib/insurance/calculate-premium";
import type { InsuranceResult } from "@/lib/insurance/types";
import { insuranceInputSchema, type InsuranceFormValues } from "@/schemas/insurance";
import { formatMileage, formatPrice } from "@/lib/utils";

export type InsurancePrefill = Partial<InsuranceFormValues>;

const DEFAULT_VALUES: InsuranceFormValues = {
  vehiclePrice: 25_000_000,
  year: new Date().getFullYear() - 3,
  mileage: 45_000,
  driverAge: 30,
  yearsLicensed: 5,
  region: "seoul",
  hasOwnDamage: true,
  accidentHistory: "none",
};

function mergePrefill(prefill?: InsurancePrefill): InsuranceFormValues {
  return {
    ...DEFAULT_VALUES,
    ...prefill,
  };
}

function InsuranceResultCard({ result }: { result: InsuranceResult }) {
  const t = useTranslations("insurance");

  return (
    <div className="space-y-3 rounded-2xl border border-primary/20 bg-primary/5 p-4">
      <div className="flex items-center gap-2">
        <Shield className="h-5 w-5 text-primary" />
        <h2 className="text-sm font-semibold">{t("resultTitle")}</h2>
      </div>
      <div className="space-y-1">
        <p className="text-xs text-muted-foreground">{t("monthlyEstimate")}</p>
        <p className="text-2xl font-bold text-primary">
          {formatPrice(result.monthlyLow)} – {formatPrice(result.monthlyHigh)}
        </p>
      </div>
      <div className="space-y-1">
        <p className="text-xs text-muted-foreground">{t("yearlyEstimate")}</p>
        <p className="text-sm font-medium">
          {formatPrice(result.yearlyLow)} – {formatPrice(result.yearlyHigh)}
        </p>
      </div>
      <p className="text-xs leading-relaxed text-muted-foreground">
        {t("disclaimer")}
      </p>
    </div>
  );
}

export function InsuranceCalculator({ prefill }: { prefill?: InsurancePrefill }) {
  const t = useTranslations("insurance");
  const initial = mergePrefill(prefill);

  const [vehiclePrice, setVehiclePrice] = useState(String(initial.vehiclePrice));
  const [year, setYear] = useState(String(initial.year));
  const [mileage, setMileage] = useState(String(initial.mileage));
  const [driverAge, setDriverAge] = useState(String(initial.driverAge));
  const [yearsLicensed, setYearsLicensed] = useState(String(initial.yearsLicensed));
  const [region, setRegion] = useState<InsuranceFormValues["region"]>(initial.region);
  const [hasOwnDamage, setHasOwnDamage] = useState(initial.hasOwnDamage);
  const [accidentHistory, setAccidentHistory] = useState<
    InsuranceFormValues["accidentHistory"]
  >(initial.accidentHistory);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<InsuranceResult | null>(() => {
    const parsed = insuranceInputSchema.safeParse(initial);
    return parsed.success ? calculateInsurancePremium(parsed.data) : null;
  });

  const prefillSummary = useMemo(() => {
    if (!prefill?.vehiclePrice && !prefill?.year && !prefill?.mileage) {
      return null;
    }

    const parts: string[] = [];
    if (prefill.vehiclePrice) {
      parts.push(formatPrice(prefill.vehiclePrice));
    }
    if (prefill.year) {
      parts.push(String(prefill.year));
    }
    if (prefill.mileage !== undefined) {
      parts.push(formatMileage(prefill.mileage));
    }

    return parts.join(" · ");
  }, [prefill]);

  function handleCalculate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const payload = {
      vehiclePrice: Number(vehiclePrice),
      year: Number(year),
      mileage: Number(mileage),
      driverAge: Number(driverAge),
      yearsLicensed: Number(yearsLicensed),
      region,
      hasOwnDamage,
      accidentHistory,
    };

    const parsed = insuranceInputSchema.safeParse(payload);

    if (!parsed.success) {
      setError(parsed.error.errors[0]?.message ?? t("invalidForm"));
      return;
    }

    setResult(calculateInsurancePremium(parsed.data));
    window.Telegram?.WebApp?.HapticFeedback?.impactOccurred("light");
  }

  return (
    <div className="space-y-6">
      {prefillSummary ? (
        <p className="rounded-xl border border-border/60 bg-card/60 px-3 py-2 text-xs text-muted-foreground">
          {t("prefillHint")}: {prefillSummary}
        </p>
      ) : null}

      <form onSubmit={handleCalculate} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2 space-y-1.5">
            <Label htmlFor="vehiclePrice">{t("vehiclePrice")}</Label>
            <Input
              id="vehiclePrice"
              inputMode="numeric"
              value={vehiclePrice}
              onChange={(e) => setVehiclePrice(e.target.value)}
              className="h-11 rounded-xl bg-card/50"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="year">{t("year")}</Label>
            <Input
              id="year"
              inputMode="numeric"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="h-11 rounded-xl bg-card/50"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="mileage">{t("mileage")}</Label>
            <Input
              id="mileage"
              inputMode="numeric"
              value={mileage}
              onChange={(e) => setMileage(e.target.value)}
              className="h-11 rounded-xl bg-card/50"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="driverAge">{t("driverAge")}</Label>
            <Input
              id="driverAge"
              inputMode="numeric"
              value={driverAge}
              onChange={(e) => setDriverAge(e.target.value)}
              className="h-11 rounded-xl bg-card/50"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="yearsLicensed">{t("yearsLicensed")}</Label>
            <Input
              id="yearsLicensed"
              inputMode="numeric"
              value={yearsLicensed}
              onChange={(e) => setYearsLicensed(e.target.value)}
              className="h-11 rounded-xl bg-card/50"
              required
            />
          </div>

          <div className="col-span-2 space-y-1.5">
            <Label htmlFor="region">{t("region")}</Label>
            <Select
              id="region"
              value={region}
              onChange={(e) =>
                setRegion(e.target.value as InsuranceFormValues["region"])
              }
              className="h-11"
            >
              <option value="seoul">{t("regionSeoul")}</option>
              <option value="gyeonggi">{t("regionGyeonggi")}</option>
              <option value="other">{t("regionOther")}</option>
            </Select>
          </div>

          <div className="col-span-2 space-y-1.5">
            <Label htmlFor="accidentHistory">{t("accidentHistory")}</Label>
            <Select
              id="accidentHistory"
              value={accidentHistory}
              onChange={(e) =>
                setAccidentHistory(
                  e.target.value as InsuranceFormValues["accidentHistory"],
                )
              }
              className="h-11"
            >
              <option value="none">{t("accidentNone")}</option>
              <option value="one">{t("accidentOne")}</option>
              <option value="multiple">{t("accidentMultiple")}</option>
            </Select>
          </div>

          <div className="col-span-2 flex items-center gap-3 rounded-xl border border-border/60 bg-card/40 px-3 py-3">
            <input
              id="hasOwnDamage"
              type="checkbox"
              checked={hasOwnDamage}
              onChange={(e) => setHasOwnDamage(e.target.checked)}
              className="h-4 w-4 rounded border-input accent-primary"
            />
            <Label htmlFor="hasOwnDamage" className="cursor-pointer font-normal">
              {t("ownDamage")}
            </Label>
          </div>
        </div>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        <Button type="submit" className="h-11 w-full rounded-xl" size="lg">
          <Calculator className="h-4 w-4" />
          {t("calculate")}
        </Button>
      </form>

      {result ? <InsuranceResultCard result={result} /> : null}
    </div>
  );
}
