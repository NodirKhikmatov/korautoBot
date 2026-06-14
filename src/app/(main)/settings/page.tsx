"use client";

import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { ContactSettings } from "@/components/settings/contact-settings";
import { ThemeSwitcher } from "@/components/theme/theme-switcher";
import { PageHeader } from "@/components/layout/page-header";
import { useTranslations } from "next-intl";

export default function SettingsPage() {
  const t = useTranslations("settings");

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} subtitle={t("subtitle")} />

      <section className="space-y-3" aria-labelledby="appearance-heading">
        <h2
          id="appearance-heading"
          className="text-xs font-medium uppercase tracking-wider text-muted-foreground"
        >
          {t("appearance")}
        </h2>
        <ThemeSwitcher />
        <LanguageSwitcher />
        <ContactSettings />
      </section>
    </div>
  );
}
