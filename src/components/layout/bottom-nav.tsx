"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Home, PlusCircle, Search, User } from "lucide-react";
import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  labelKey: "home" | "search" | "sell" | "saved" | "profile";
  icon: typeof Home;
  highlight?: boolean;
};

const NAV_ITEMS: NavItem[] = [
  { href: "/", labelKey: "home", icon: Home },
  { href: "/search", labelKey: "search", icon: Search },
  { href: "/create", labelKey: "sell", icon: PlusCircle, highlight: true },
  { href: "/favorites", labelKey: "saved", icon: Heart },
  { href: "/profile", labelKey: "profile", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();
  const t = useTranslations("nav");

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border/60 bg-card/95 backdrop-blur-xl supports-[backdrop-filter]:bg-card/80"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="mx-auto flex h-16 w-full max-w-lg items-center justify-around px-2 sm:max-w-xl md:max-w-xl">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={false}
              className={cn(
                "flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 transition-colors",
                item.highlight && "relative",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {item.highlight ? (
                <span
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full shadow-lg transition-transform",
                    isActive
                      ? "bg-primary text-primary-foreground scale-105"
                      : "bg-primary/90 text-primary-foreground",
                  )}
                >
                  <Icon className="h-5 w-5" />
                </span>
              ) : (
                <Icon className={cn("h-5 w-5", isActive && "stroke-[2.5]")} />
              )}
              <span className="text-[10px] font-medium tracking-wide">
                {t(item.labelKey)}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
