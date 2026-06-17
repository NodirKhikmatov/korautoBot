"use client";

import { PageHeader } from "@/components/layout/page-header";
import { AdminCreateListingForm } from "@/components/admin/admin-create-listing-form";

export default function AdminCreateListingPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Import listing"
        subtitle="Add a car from another app with the original seller's contact"
      />
      <AdminCreateListingForm />
    </div>
  );
}
