"use client";

import { Heart } from "lucide-react";

import { AuthGate } from "@/components/auth/auth-gate";
import { CarGrid, CarGridSkeleton } from "@/components/cars/car-grid";
import { EmptyState } from "@/components/layout/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { useFavorites } from "@/hooks/use-favorites";

function FavoritesContent() {
  const { favorites, isLoading } = useFavorites();

  return (
    <div className="space-y-5">
      <PageHeader
        title="Favorites"
        subtitle={
          favorites.length > 0
            ? `${favorites.length} saved listings`
            : "Your saved cars"
        }
      />

      {isLoading && <CarGridSkeleton />}

      {!isLoading && favorites.length === 0 && (
        <EmptyState
          icon={Heart}
          title="No favorites yet"
          description="Tap the heart on any listing to save it here."
        />
      )}

      {!isLoading && favorites.length > 0 && <CarGrid cars={favorites} />}
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
