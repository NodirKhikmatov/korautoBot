"use client";

import { AuthGate } from "@/components/auth/auth-gate";
import { CreateListingForm } from "@/components/cars/create-listing-form";
import { PageHeader } from "@/components/layout/page-header";

export default function CreatePage() {
  return (
    <AuthGate message="Sign in with Telegram to create a listing">
      <div className="space-y-6">
        <PageHeader
          title="Sell your car"
          subtitle="Add photos and details to publish your listing"
        />
        <CreateListingForm />
      </div>
    </AuthGate>
  );
}
