"use client";

import Link from "next/link";
import { ArrowRight, Car, Sparkles } from "lucide-react";

import { CarGrid, CarGridSkeleton } from "@/components/cars/car-grid";
import { EmptyState } from "@/components/layout/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { useCars } from "@/hooks/use-cars";
import { useFeaturedCars } from "@/hooks/use-featured-cars";
import { APP_NAME } from "@/lib/constants";

export function HomePageClient() {
  const { data, isLoading, isError } = useCars({ limit: 12 });
  const featured = useFeaturedCars();

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-2xl border border-border/60 bg-card/60 p-5 backdrop-blur-sm">
        <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-primary/10 blur-2xl" />
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wider text-primary">
              South Korea
            </p>
            <h1 className="text-xl font-bold leading-tight">{APP_NAME}</h1>
            <p className="text-sm text-muted-foreground">
              Premium used cars from Korea. Browse, compare, connect.
            </p>
          </div>
        </div>
        <Button asChild className="mt-4 w-full rounded-xl" size="lg">
          <Link href="/search" prefetch={false}>
            Explore listings
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </section>

      {(featured.isLoading || (featured.data && featured.data.cars.length > 0)) && (
        <section className="space-y-4">
          <PageHeader
            title="Featured listings"
            subtitle="Hand-picked premium cars"
            headingLevel={2}
          />
          {featured.isLoading ? (
            <CarGridSkeleton count={4} />
          ) : (
            <CarGrid cars={featured.data!.cars} />
          )}
        </section>
      )}

      <section className="space-y-4">
        <PageHeader
          title="Latest listings"
          subtitle="Fresh arrivals on the market"
          headingLevel={2}
        />

        {isLoading && <CarGridSkeleton />}

        {isError && (
          <EmptyState
            icon={Car}
            title="Could not load listings"
            description="Check your connection and try again."
          />
        )}

        {data && data.cars.length === 0 && (
          <EmptyState
            icon={Car}
            title="No listings yet"
            description="Be the first to list a car on the marketplace."
          />
        )}

        {data && data.cars.length > 0 && <CarGrid cars={data.cars} />}
      </section>
    </div>
  );
}
