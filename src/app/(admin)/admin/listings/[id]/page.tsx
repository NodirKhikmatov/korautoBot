"use client";

import { use } from "react";
import { Car } from "lucide-react";
import { useTranslations } from "next-intl";

import { AdminEditCarForm } from "@/components/admin/admin-edit-car-form";
import { EmptyState } from "@/components/layout/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminCar } from "@/hooks/use-admin";

export default function AdminEditListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const t = useTranslations("listing");
  const { id } = use(params);
  const { data, isLoading, isError } = useAdminCar(id);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  if (isError || !data?.car) {
    return (
      <EmptyState
        icon={Car}
        title={t("notFound")}
        description={t("notFoundDescription")}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title={t("editTitle")} subtitle={data.car.title} />
      <AdminEditCarForm car={data.car} />
    </div>
  );
}
