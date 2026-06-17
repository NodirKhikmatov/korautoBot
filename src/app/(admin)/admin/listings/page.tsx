"use client";

import Link from "next/link";
import { useState } from "react";
import { Car, Plus, Search } from "lucide-react";

import { AdminListingRow } from "@/components/admin/admin-listing-row";
import { EmptyState } from "@/components/layout/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminCars, useAdminMutations } from "@/hooks/use-admin";

export default function AdminListingsPage() {
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useAdminCars(query, page);
  const { deleteCar, featureCar } = useAdminMutations();

  const cars = data?.cars ?? [];
  const total = data?.total ?? 0;
  const hasMore = page * 20 < total;

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    setQuery(search.trim());
  }

  async function handleDelete(carId: string) {
    if (!confirm("Delete this listing? This cannot be undone.")) return;
    await deleteCar.mutateAsync(carId);
  }

  async function handleFeature(carId: string, isFeatured: boolean) {
    await featureCar.mutateAsync({ carId, isFeatured });
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Listings"
        subtitle={total > 0 ? `${total} total listings` : "All marketplace listings"}
        action={
          <Button asChild size="sm" className="h-9 rounded-xl">
            <Link href="/admin/listings/create">
              <Plus className="h-4 w-4" />
              Import
            </Link>
          </Button>
        }
      />

      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, brand, model…"
            className="h-11 rounded-xl bg-card/50 pl-9"
          />
        </div>
        <Button type="submit" className="h-11 rounded-xl px-4">
          Go
        </Button>
      </form>

      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-2xl" />
          ))}
        </div>
      )}

      {isError && (
        <EmptyState
          icon={Car}
          title="Could not load listings"
          description="Check your connection and try again."
        />
      )}

      {!isLoading && !isError && cars.length === 0 && (
        <EmptyState
          icon={Car}
          title="No listings found"
          description={query ? "Try a different search term." : "No listings on the platform yet."}
        />
      )}

      {!isLoading && cars.length > 0 && (
        <div className="space-y-3">
          {cars.map((car) => (
            <AdminListingRow
              key={car.id}
              car={car}
              onDelete={handleDelete}
              onFeature={handleFeature}
              isDeleting={deleteCar.isPending}
              isFeaturing={featureCar.isPending}
            />
          ))}
        </div>
      )}

      {(page > 1 || hasMore) && (
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            className="h-10 rounded-xl"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            className="h-10 rounded-xl"
            disabled={!hasMore}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
