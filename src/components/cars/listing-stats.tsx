"use client";

import { Eye, MessageCircle } from "lucide-react";
import { useTranslations } from "next-intl";

import { useAdminAccess } from "@/hooks/use-admin";
import { cn } from "@/lib/utils";

export function ListingStats({
  viewCount,
  contactCount,
  className,
  size = "sm",
}: {
  viewCount: number;
  contactCount: number;
  className?: string;
  size?: "sm" | "xs";
}) {
  const t = useTranslations("listing");
  const { data: adminAccess } = useAdminAccess();

  if (!adminAccess?.isAdmin) {
    return null;
  }

  const textClass = size === "xs" ? "text-[11px]" : "text-xs";
  const iconClass = size === "xs" ? "h-3 w-3" : "h-3.5 w-3.5";

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-3 gap-y-1 text-muted-foreground",
        textClass,
        className,
      )}
    >
      <span className="inline-flex items-center gap-1">
        <Eye className={iconClass} aria-hidden />
        {t("viewCount", { count: viewCount })}
      </span>
      <span className="inline-flex items-center gap-1">
        <MessageCircle className={iconClass} aria-hidden />
        {t("contactCount", { count: contactCount })}
      </span>
    </div>
  );
}
