"use client";

import {
  Car,
  Heart,
  ShieldBan,
  Sparkles,
  Users,
} from "lucide-react";
import { useTranslations } from "next-intl";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { AdminStats } from "@/types";

const STAT_ITEMS = [
  { key: "totalUsers", labelKey: "statUsers", icon: Users },
  { key: "totalCars", labelKey: "statListings", icon: Car },
  { key: "activeCars", labelKey: "statActive", icon: Car },
  { key: "featuredCars", labelKey: "statFeatured", icon: Sparkles },
  { key: "bannedUsers", labelKey: "statBanned", icon: ShieldBan },
  { key: "totalFavorites", labelKey: "statFavorites", icon: Heart },
] as const;

export function AdminStatsGrid({
  stats,
  isLoading,
}: {
  stats?: AdminStats;
  isLoading: boolean;
}) {
  const t = useTranslations("admin");

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
                <span className="text-xs font-medium">{t(item.labelKey)}</span>
              </div>
              <p className="mt-2 text-2xl font-bold tabular-nums">{value}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
