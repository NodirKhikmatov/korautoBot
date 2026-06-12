"use client";

import Link from "next/link";
import { Car, Heart, LogOut, PlusCircle, Shield } from "lucide-react";

import { AuthGate } from "@/components/auth/auth-gate";
import { CarGrid, CarGridSkeleton } from "@/components/cars/car-grid";
import { EmptyState } from "@/components/layout/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAdminAccess } from "@/hooks/use-admin";
import { useAuth } from "@/hooks/use-auth";
import { useMyCars } from "@/hooks/use-my-cars";
import { getDisplayName } from "@/lib/format";

function ProfileContent() {
  const { user, logout } = useAuth();
  const { data: adminAccess } = useAdminAccess();
  const { data, isLoading } = useMyCars();

  if (!user) return null;

  const displayName = getDisplayName(
    user.firstName,
    user.lastName,
    user.username,
  );
  const myCars = data?.cars ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 rounded-2xl border border-border/60 bg-card/50 p-5">
        <Avatar
          className="h-16 w-16 text-lg"
          src={user.photoUrl}
          alt={displayName}
          fallback={displayName}
        />
        <div className="min-w-0 space-y-0.5">
          <h1 className="text-lg font-bold">{displayName}</h1>
          {user.username && (
            <p className="text-sm text-muted-foreground">@{user.username}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button
          asChild
          variant="outline"
          className="h-11 rounded-xl justify-start gap-2"
        >
          <Link href="/create">
            <PlusCircle className="h-4 w-4" />
            New listing
          </Link>
        </Button>
        <Button
          asChild
          variant="outline"
          className="h-11 rounded-xl justify-start gap-2"
        >
          <Link href="/favorites">
            <Heart className="h-4 w-4" />
            Favorites
          </Link>
        </Button>
        {adminAccess?.isAdmin && (
          <Button
            asChild
            variant="outline"
            className="col-span-2 h-11 rounded-xl justify-start gap-2"
          >
            <Link href="/admin">
              <Shield className="h-4 w-4" />
              Admin dashboard
            </Link>
          </Button>
        )}
      </div>

      <Separator />

      <section className="space-y-4">
        <PageHeader
          title="My listings"
          subtitle={
            myCars.length > 0
              ? `${myCars.length} active listings`
              : "Cars you've posted"
          }
        />

        {isLoading && <CarGridSkeleton count={4} />}

        {!isLoading && myCars.length === 0 && (
          <EmptyState
            icon={Car}
            title="No listings yet"
            description="Create your first listing to start selling."
          />
        )}

        {!isLoading && myCars.length > 0 && <CarGrid cars={myCars} />}
      </section>

      <Button
        variant="ghost"
        className="w-full rounded-xl text-muted-foreground"
        onClick={() => logout()}
      >
        <LogOut className="h-4 w-4" />
        Sign out
      </Button>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <AuthGate message="Sign in with Telegram to view your profile">
      <ProfileContent />
    </AuthGate>
  );
}
