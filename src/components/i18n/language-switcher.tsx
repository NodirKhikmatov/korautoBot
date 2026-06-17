"use client";

import { Globe } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { Select } from "@/components/ui/select";
import { locales, type Locale } from "@/i18n/config";
import { useChangeLocale } from "@/i18n/locale";
import { cn } from "@/lib/utils";

type LanguageSwitcherProps = {
  variant?: "card" | "compact";
  className?: string;
};

export function LanguageSwitcher({
  variant = "card",
  className,
}: LanguageSwitcherProps) {
  const t = useTranslations("settings");
  const locale = useLocale() as Locale;
  const changeLocale = useChangeLocale();

  const select = (
    <Select
      value={locale}
      onChange={(e) => changeLocale(e.target.value as Locale)}
      className={cn(
        "h-11 rounded-xl bg-background/50",
        variant === "compact" && "flex-1",
      )}
      aria-label={t("language")}
    >
      {locales.map((code) => (
        <option key={code} value={code}>
          {t(`languages.${code}`)}
        </option>
      ))}
    </Select>
  );

  if (variant === "compact") {
    return (
      <div
        className={cn(
          "flex items-center gap-3 rounded-2xl border border-border/60 bg-card/50 p-4",
          className,
        )}
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
          <Globe className="h-5 w-5 text-primary" />
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          <p className="text-sm font-medium">{t("language")}</p>
          {select}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "space-y-2 rounded-2xl border border-border/60 bg-card/50 p-4",
        className,
      )}
    >
      <div className="space-y-0.5">
        <p className="text-sm font-medium">{t("language")}</p>
        <p className="text-xs text-muted-foreground">
          {t("languageDescription")}
        </p>
      </div>
      {select}
    </div>
  );
}
