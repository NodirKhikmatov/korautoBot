"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { useThemePreference } from "@/hooks/use-theme-preference";
import type { ThemePreference } from "@/lib/theme/constants";
import { cn } from "@/lib/utils";

const THEME_ICONS: Record<ThemePreference, typeof Sun> = {
  light: Sun,
  dark: Moon,
  system: Monitor,
};

export function ThemeSwitcher({ className }: { className?: string }) {
  const t = useTranslations("settings");
  const { preference, setPreference, preferences, mounted, isTelegram } =
    useThemePreference();

  return (
    <div
      className={cn(
        "space-y-3 rounded-2xl border border-border/60 bg-card/50 p-4",
        className,
      )}
    >
      <div className="space-y-0.5">
        <p className="text-sm font-medium">{t("theme")}</p>
        <p className="text-xs text-muted-foreground">
          {isTelegram ? t("themeDescriptionTelegram") : t("themeDescription")}
        </p>
      </div>

      <div
        className="grid grid-cols-3 gap-2"
        role="group"
        aria-label={t("theme")}
      >
        {preferences.map((value) => {
          const Icon = THEME_ICONS[value];
          const isActive = preference === value;

          return (
            <Button
              key={value}
              type="button"
              variant={isActive ? "default" : "outline"}
              className="h-auto min-h-11 flex-col gap-1 rounded-xl py-2.5 text-xs"
              disabled={!mounted}
              onClick={() => setPreference(value)}
              aria-pressed={isActive}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="truncate">{t(`themes.${value}`)}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
