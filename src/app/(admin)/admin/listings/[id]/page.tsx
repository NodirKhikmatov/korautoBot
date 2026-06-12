"use client";

import { use } from "react";
import { Car } from "lucide-react";

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
        title="Listing not found"
        description="This listing may have been deleted."
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit listing"
        subtitle={data.car.title}
      />
      <AdminEditCarForm car={data.car} />
    </div>
  );
}
