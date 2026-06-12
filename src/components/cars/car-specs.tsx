import {
  Calendar,
  Cog,
  Fuel,
  Gauge,
  MapPin,
  Tag,
} from "lucide-react";

import { formatFuelType, formatTransmission } from "@/lib/format";
import { formatMileage, formatPrice } from "@/lib/utils";
import type { CarWithSeller } from "@/types";

function SpecItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-card/50 p-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="truncate text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}

export function CarSpecs({ car }: { car: CarWithSeller }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <SpecItem icon={Tag} label="Price" value={formatPrice(car.price)} />
      <SpecItem icon={Calendar} label="Year" value={String(car.year)} />
      <SpecItem icon={Gauge} label="Mileage" value={formatMileage(car.mileage)} />
      <SpecItem icon={Fuel} label="Fuel" value={formatFuelType(car.fuelType)} />
      <SpecItem
        icon={Cog}
        label="Transmission"
        value={formatTransmission(car.transmission)}
      />
      {car.location && (
        <SpecItem icon={MapPin} label="Location" value={car.location} />
      )}
    </div>
  );
}
