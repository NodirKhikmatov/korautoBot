"use client";

import { useTranslations } from "next-intl";

import { AuthGate } from "@/components/auth/auth-gate";
import { CreateListingForm } from "@/components/cars/create-listing-form";
import { PageHeader } from "@/components/layout/page-header";

export default function CreatePage() {
  const t = useTranslations("listing");

  return (
    <AuthGate messageKey="signInForCreate">
      <div className="space-y-6">
        <PageHeader title={t("sellTitle")} subtitle={t("sellSubtitle")} />
        <CreateListingForm />
      </div>
    </AuthGate>
  );
}
