"use client";

import {
  Car,
  Heart,
  ShieldBan,
  Sparkles,
  Users,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { AdminStats } from "@/types";

const STAT_ITEMS = [
  { key: "totalUsers", label: "Users", icon: Users },
  { key: "totalCars", label: "Listings", icon: Car },
  { key: "activeCars", label: "Active", icon: Car },
  { key: "featuredCars", label: "Featured", icon: Sparkles },
  { key: "bannedUsers", label: "Banned", icon: ShieldBan },
  { key: "totalFavorites", label: "Favorites", icon: Heart },
] as const;

export function AdminStatsGrid({
  stats,
  isLoading,
}: {
  stats?: AdminStats;
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="grid grid-cols-2 gap-3">
      {STAT_ITEMS.map((item) => {
        const Icon = item.icon;
        const value = stats[item.key];

        return (
          <Card
            key={item.key}
            className="border-border/60 bg-card/50 shadow-none"
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Icon className="h-4 w-4" />
                <span className="text-xs font-medium">{item.label}</span>
              </div>
              <p className="mt-2 text-2xl font-bold tabular-nums">{value}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
