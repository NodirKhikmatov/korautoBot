"use client";

import { useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { CAR_BRANDS, FUEL_TYPES, TRANSMISSION_TYPES } from "@/lib/constants";
import { formatFuelType, formatTransmission } from "@/lib/format";
import type { CarFilters } from "@/types";

type FilterState = CarFilters & { page?: number; limit?: number };

export function CarFiltersPanel({
  filters,
  onChange,
  onReset,
}: {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  onReset: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  function update(patch: Partial<FilterState>) {
    onChange({ ...filters, ...patch, page: 1 });
  }

  const hasFilters =
    filters.search ||
    filters.brand ||
    filters.fuelType ||
    filters.transmission ||
    filters.minPrice ||
    filters.maxPrice ||
    filters.minYear ||
    filters.maxYear ||
    filters.location;

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search brand, model..."
            value={filters.search ?? ""}
            onChange={(e) => update({ search: e.target.value || undefined })}
            className="h-11 rounded-xl pl-9 bg-card/50"
          />
        </div>
        <Button
          variant={expanded ? "default" : "outline"}
          size="icon"
          className="h-11 w-11 shrink-0 rounded-xl"
          onClick={() => setExpanded(!expanded)}
        >
          <SlidersHorizontal className="h-4 w-4" />
        </Button>
      </div>

      {hasFilters && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Filters active</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 gap-1 text-xs"
            onClick={onReset}
          >
            <X className="h-3 w-3" />
            Clear
          </Button>
        </div>
      )}

      {expanded && (
        <div className="space-y-3 rounded-2xl border border-border/60 bg-card/40 p-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Brand</Label>
              <Select
                value={filters.brand ?? ""}
                onChange={(e) =>
                  update({ brand: e.target.value || undefined })
                }
              >
                <option value="">All brands</option>
                {CAR_BRANDS.map((brand) => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Fuel</Label>
              <Select
                value={filters.fuelType ?? ""}
                onChange={(e) =>
                  update({
                    fuelType: (e.target.value || undefined) as FilterState["fuelType"],
                  })
                }
              >
                <option value="">All fuels</option>
                {FUEL_TYPES.map((fuel) => (
                  <option key={fuel} value={fuel}>
                    {formatFuelType(fuel)}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Transmission</Label>
              <Select
                value={filters.transmission ?? ""}
                onChange={(e) =>
                  update({
                    transmission: (e.target.value || undefined) as FilterState["transmission"],
                  })
                }
              >
                <option value="">All</option>
                {TRANSMISSION_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {formatTransmission(t)}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Location</Label>
              <Input
                placeholder="City"
                value={filters.location ?? ""}
                onChange={(e) =>
                  update({ location: e.target.value || undefined })
                }
                className="rounded-xl bg-background/50"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Min price (₩)</Label>
              <Input
                type="number"
                placeholder="0"
                value={filters.minPrice ?? ""}
                onChange={(e) =>
                  update({
                    minPrice: e.target.value
                      ? Number(e.target.value)
                      : undefined,
                  })
                }
                className="rounded-xl bg-background/50"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Max price (₩)</Label>
              <Input
                type="number"
                placeholder="Any"
                value={filters.maxPrice ?? ""}
                onChange={(e) =>
                  update({
                    maxPrice: e.target.value
                      ? Number(e.target.value)
                      : undefined,
                  })
                }
                className="rounded-xl bg-background/50"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Min year</Label>
              <Input
                type="number"
                placeholder="1990"
                value={filters.minYear ?? ""}
                onChange={(e) =>
                  update({
                    minYear: e.target.value
                      ? Number(e.target.value)
                      : undefined,
                  })
                }
                className="rounded-xl bg-background/50"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Max year</Label>
              <Input
                type="number"
                placeholder={String(new Date().getFullYear())}
                value={filters.maxYear ?? ""}
                onChange={(e) =>
                  update({
                    maxYear: e.target.value
                      ? Number(e.target.value)
                      : undefined,
                  })
                }
                className="rounded-xl bg-background/50"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
