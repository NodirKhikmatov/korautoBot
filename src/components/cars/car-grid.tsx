import { CarCard } from "@/components/cars/car-card";
import { Skeleton } from "@/components/ui/skeleton";
import type { CarWithImages } from "@/types";

export function CarGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="aspect-[16/10] w-full rounded-2xl" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      ))}
    </div>
  );
}

export function CarGrid({
  cars,
  showStats = true,
}: {
  cars: CarWithImages[];
  showStats?: boolean;
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {cars.map((car, index) => (
        <CarCard
          key={car.id}
          car={car}
          priority={index < 2}
          showStats={showStats}
        />
      ))}
    </div>
  );
}
