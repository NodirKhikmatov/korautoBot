"use client";

import { useMemo, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { useCarFilterOptions } from "@/hooks/use-car-filter-options";
import { useTranslatedFormat } from "@/hooks/use-translated-format";
import { CAR_BRANDS, FUEL_TYPES, TRANSMISSION_TYPES } from "@/lib/constants";
import { KOREA_REGIONS } from "@/lib/search/constants";
import { countActiveFilters } from "@/lib/search/params";
import type { CarFilters } from "@/types";

export function CarFiltersPanel({
  filters,
  onChange,
  onReset,
}: {
  filters: CarFilters;
  onChange: (filters: CarFilters) => void;
  onReset: () => void;
}) {
  const t = useTranslations("search");
  const tListing = useTranslations("listing");
  const tCommon = useTranslations("common");
  const { formatFuelType, formatTransmission } = useTranslatedFormat();
  const [expanded, setExpanded] = useState(false);
  const { data: optionsData } = useCarFilterOptions(filters.brand);

  const brandOptions = useMemo(() => {
    const fromDb = optionsData?.options.brands ?? [];
    const merged = new Set([...CAR_BRANDS, ...fromDb]);
    return Array.from(merged).sort();
  }, [optionsData]);

  const modelOptions = optionsData?.options.models ?? [];

  const regionOptions = useMemo(() => {
    const fromDb = optionsData?.options.regions ?? [];
    const merged = new Set([...KOREA_REGIONS, ...fromDb]);
    return Array.from(merged).sort();
  }, [optionsData]);

  function update(patch: Partial<CarFilters>) {
    const next = { ...filters, ...patch };
    if (patch.brand !== undefined && patch.brand !== filters.brand) {
      next.model = undefined;
    }
    onChange(next);
  }

  const activeCount = countActiveFilters(filters);

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t("searchPlaceholder")}
            value={filters.search ?? ""}
            onChange={(e) => update({ search: e.target.value || undefined })}
            className="h-11 rounded-xl bg-card/50 pl-9"
          />
        </div>
        <Button
          variant={expanded ? "default" : "outline"}
          size="icon"
          className="relative h-11 w-11 shrink-0 rounded-xl"
          onClick={() => setExpanded(!expanded)}
        >
          <SlidersHorizontal className="h-4 w-4" />
          {activeCount > 0 && !expanded && (
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
              {activeCount}
            </span>
          )}
        </Button>
      </div>

      {activeCount > 0 && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {t("filtersActive", { count: activeCount })}
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 gap-1 text-xs"
            onClick={onReset}
          >
            <X className="h-3 w-3" />
            {t("clearAll")}
          </Button>
        </div>
      )}

      {expanded && (
        <div className="space-y-3 rounded-2xl border border-border/60 bg-card/40 p-4">
          <div className="grid grid-cols-2 gap-3">
            <FilterSelect
              label={tListing("brand")}
              value={filters.brand ?? ""}
              onChange={(value) => update({ brand: value || undefined })}
              options={brandOptions}
              placeholder={t("allBrands")}
            />
            <FilterSelect
              label={tListing("model")}
              value={filters.model ?? ""}
              onChange={(value) => update({ model: value || undefined })}
              options={modelOptions}
              placeholder={
                filters.brand ? t("allModels") : t("selectBrandFirst")
              }
              disabled={!filters.brand && modelOptions.length === 0}
            />
            <FilterSelect
              label={tListing("region")}
              value={filters.region ?? ""}
              onChange={(value) => update({ region: value || undefined })}
              options={regionOptions}
              placeholder={t("allRegions")}
            />
            <FilterSelect
              label={tListing("fuel")}
              value={filters.fuelType ?? ""}
              onChange={(value) =>
                update({
                  fuelType: (value || undefined) as CarFilters["fuelType"],
                })
              }
              options={FUEL_TYPES.map((fuel) => ({
                value: fuel,
                label: formatFuelType(fuel),
              }))}
              placeholder={t("allFuels")}
            />
            <FilterSelect
              label={tListing("transmission")}
              value={filters.transmission ?? ""}
              onChange={(value) =>
                update({
                  transmission: (value || undefined) as CarFilters["transmission"],
                })
              }
              options={TRANSMISSION_TYPES.map((trans) => ({
                value: trans,
                label: formatTransmission(trans),
              }))}
              placeholder={tCommon("all")}
            />
            <NumberField
              label={t("minPrice")}
              value={filters.minPrice}
              onChange={(v) => update({ minPrice: v })}
              placeholder="0"
            />
            <NumberField
              label={t("maxPrice")}
              value={filters.maxPrice}
              onChange={(v) => update({ maxPrice: v })}
              placeholder={tCommon("any")}
            />
            <NumberField
              label={t("minYear")}
              value={filters.minYear}
              onChange={(v) => update({ minYear: v })}
              placeholder="1990"
            />
            <NumberField
              label={t("maxYear")}
              value={filters.maxYear}
              onChange={(v) => update({ maxYear: v })}
              placeholder={String(new Date().getFullYear())}
            />
            <NumberField
              label={t("minMileage")}
              value={filters.minMileage}
              onChange={(v) => update({ minMileage: v })}
              placeholder="0"
            />
            <NumberField
              label={t("maxMileage")}
              value={filters.maxMileage}
              onChange={(v) => update({ maxMileage: v })}
              placeholder={tCommon("any")}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
  placeholder,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[] | Array<{ value: string; label: string }>;
  placeholder: string;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Select
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => {
          const optValue = typeof option === "string" ? option : option.value;
          const optLabel = typeof option === "string" ? option : option.label;
          return (
            <option key={optValue} value={optValue}>{optLabel}</option>
          );
        })}
      </Select>
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value?: number;
  onChange: (value: number | undefined) => void;
  placeholder: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input
        type="number"
        placeholder={placeholder}
        value={value ?? ""}
        onChange={(e) =>
          onChange(e.target.value ? Number(e.target.value) : undefined)
        }
        className="rounded-xl bg-background/50"
      />
    </div>
  );
}
