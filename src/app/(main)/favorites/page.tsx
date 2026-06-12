"use client";

import Link from "next/link";
import { Heart, Search } from "lucide-react";

import { AuthGate } from "@/components/auth/auth-gate";
import { FavoritesList } from "@/components/cars/favorites-list";
import { CarGridSkeleton } from "@/components/cars/car-grid";
import { EmptyState } from "@/components/layout/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { useFavorites } from "@/hooks/use-favorites";

function FavoritesContent() {
  const { favorites, total, isLoading } = useFavorites();

  return (
    <div className="space-y-5">
      <PageHeader
        title="Favorites"
        subtitle={
          total > 0
            ? `${total} saved listing${total === 1 ? "" : "s"}`
            : "Your saved cars"
        }
      />

      {isLoading && <CarGridSkeleton count={4} />}

      {!isLoading && favorites.length === 0 && (
        <div className="space-y-4">
          <EmptyState
            icon={Heart}
            title="No favorites yet"
            description="Tap the heart on any listing to save it here."
          />
          <Button asChild variant="outline" className="w-full rounded-xl">
            <Link href="/search">
              <Search className="h-4 w-4" />
              Browse listings
            </Link>
          </Button>
        </div>
      )}

      {!isLoading && favorites.length > 0 && <FavoritesList />}
    </div>
  );
}

export default function FavoritesPage() {
  return (
    <AuthGate message="Sign in with Telegram to view your favorites">
      <FavoritesContent />
    </AuthGate>
  );
}
