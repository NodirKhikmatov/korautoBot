"use client";

import { ShieldBan, ShieldCheck } from "lucide-react";
import { useTranslations } from "next-intl";

import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getDisplayName } from "@/lib/format";
import type { AdminUserListItem } from "@/services/admin";

export function AdminUserRow({
  user,
  onBan,
  isBanning,
}: {
  user: AdminUserListItem;
  onBan: (userId: string, banned: boolean) => void;
  isBanning?: boolean;
}) {
  const t = useTranslations("admin");
  const tCommon = useTranslations("common");
  const displayName =
    getDisplayName(user.firstName, user.lastName, user.username) ||
    tCommon("user");
  const isBanned = Boolean(user.bannedAt);

  return (
    <div className="rounded-2xl border border-border/60 bg-card/50 p-4">
      <div className="flex items-center gap-3">
        <Avatar
          className="h-12 w-12"
          src={user.photoUrl}
          alt={displayName}
          fallback={displayName}
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <p className="truncate font-semibold">{displayName}</p>
            {user.isAdmin && (
              <Badge className="rounded-md px-1.5 py-0 text-[10px]">
                {t("adminBadge")}
              </Badge>
            )}
            {isBanned && (
              <Badge variant="destructive" className="rounded-md px-1.5 py-0 text-[10px]">
                {t("bannedBadge")}
              </Badge>
            )}
          </div>
          {user.username && (
            <p className="text-sm text-muted-foreground">@{user.username}</p>
          )}
          <p className="text-xs text-muted-foreground">
            {t("listingsCount", {
              count: user.listingCount,
              telegramId: user.telegramId,
            })}
          </p>
        </div>
      </div>

      <Button
        variant="outline"
        size="sm"
        className="mt-3 h-9 w-full rounded-xl"
        disabled={isBanning}
        onClick={() => onBan(user.id, !isBanned)}
      >
        {isBanned ? (
          <>
            <ShieldCheck className="h-3.5 w-3.5" />
            {t("unbanUser")}
          </>
        ) : (
          <>
            <ShieldBan className="h-3.5 w-3.5" />
            {t("banUser")}
          </>
        )}
      </Button>
    </div>
  );
}
