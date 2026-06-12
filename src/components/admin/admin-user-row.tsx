"use client";

import { ShieldBan, ShieldCheck } from "lucide-react";

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
  const displayName = getDisplayName(
    user.firstName,
    user.lastName,
    user.username,
  );
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
              <Badge className="rounded-md px-1.5 py-0 text-[10px]">Admin</Badge>
            )}
            {isBanned && (
              <Badge variant="destructive" className="rounded-md px-1.5 py-0 text-[10px]">
                Banned
              </Badge>
            )}
          </div>
          {user.username && (
            <p className="text-sm text-muted-foreground">@{user.username}</p>
          )}
          <p className="text-xs text-muted-foreground">
            {user.listingCount} listings · ID {user.telegramId}
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
            Unban user
          </>
        ) : (
          <>
            <ShieldBan className="h-3.5 w-3.5" />
            Ban user
          </>
        )}
      </Button>
    </div>
  );
}
