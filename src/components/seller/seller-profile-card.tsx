"use client";

import { Phone, Send } from "lucide-react";
import { useTranslations } from "next-intl";

import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatPhoneDisplay } from "@/lib/contact/phone";
import { getDisplayName } from "@/lib/format";
import type { EffectiveSeller } from "@/lib/seller/effective-seller";
import { formatTelegramUsername } from "@/lib/telegram/contact";

export function SellerProfileCard({ seller }: { seller: EffectiveSeller }) {
  const t = useTranslations("seller");
  const tAdmin = useTranslations("admin");
  const tCommon = useTranslations("common");
  const displayName = seller.isExternal
    ? (seller.firstName ?? tCommon("user"))
    : getDisplayName(seller.firstName, seller.lastName, seller.username) ||
      tCommon("user");
  const usernameLabel = seller.username
    ? formatTelegramUsername(seller.username)
    : null;
  const phoneLabel = seller.phone ? formatPhoneDisplay(seller.phone) : null;

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
            {seller.isExternal ? (
              <Badge
                variant="secondary"
                className="shrink-0 rounded-md px-1.5 py-0 text-[10px]"
              >
                {tAdmin("externalSeller")}
              </Badge>
            ) : (
              <Badge
                variant="secondary"
                className="shrink-0 gap-1 border-primary/20 bg-primary/10 text-[10px] text-primary"
              >
                <Send className="h-3 w-3" />
                {t("telegram")}
              </Badge>
            )}
          </div>
          {usernameLabel && (
            <p className="truncate text-sm font-medium text-primary">
              {usernameLabel}
            </p>
          )}
          {seller.telegramId && !usernameLabel && (
            <p className="truncate text-sm text-muted-foreground">
              {t("telegramId", { id: seller.telegramId })}
            </p>
          )}
          {phoneLabel && (
            <p className="flex items-center gap-1 truncate text-sm text-muted-foreground">
              <Phone className="h-3.5 w-3.5 shrink-0" />
              {phoneLabel}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
