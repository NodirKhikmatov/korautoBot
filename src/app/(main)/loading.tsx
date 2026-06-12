import { CarGridSkeleton } from "@/components/cars/car-grid";
import { Skeleton } from "@/components/ui/skeleton";

export default function MainLoading() {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border/60 bg-card/60 p-5">
        <div className="flex items-start gap-3">
          <Skeleton className="h-10 w-10 shrink-0 rounded-xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-56" />
          </div>
        </div>
        <Skeleton className="mt-4 h-11 w-full rounded-xl" />
      </section>

      <section className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
        <CarGridSkeleton count={4} />
      </section>

      <section className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
        <CarGridSkeleton />
      </section>
    </div>
  );
}
