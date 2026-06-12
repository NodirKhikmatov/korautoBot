"use client";

import { Send } from "lucide-react";
import { useTranslations } from "next-intl";

import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getDisplayName } from "@/lib/format";
import { formatTelegramUsername } from "@/lib/telegram/contact";
import type { SellerProfile } from "@/types";

export function SellerProfileCard({ seller }: { seller: SellerProfile }) {
  const t = useTranslations("seller");
  const tCommon = useTranslations("common");
  const displayName =
    getDisplayName(
      seller.firstName,
      seller.lastName,
      seller.username,
    ) || tCommon("user");
  const usernameLabel = seller.username
    ? formatTelegramUsername(seller.username)
    : null;

  return (
    <div className="rounded-2xl border border-border/60 bg-card/50 p-4">
      <div className="flex items-center gap-3">
        <Avatar
          className="h-14 w-14 text-base ring-2 ring-primary/20"
          src={seller.photoUrl}
          alt={displayName}
          fallback={displayName}
        />
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <p className="truncate font-semibold">{displayName}</p>
            <Badge
              variant="secondary"
              className="shrink-0 gap-1 border-primary/20 bg-primary/10 text-[10px] text-primary"
            >
              <Send className="h-3 w-3" />
              {t("telegram")}
            </Badge>
          </div>
          {usernameLabel && (
            <p className="truncate text-sm font-medium text-primary">
              {usernameLabel}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
