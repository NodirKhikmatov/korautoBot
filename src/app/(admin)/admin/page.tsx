"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { AdminStatsGrid } from "@/components/admin/admin-stats-grid";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { useAdminStats } from "@/hooks/use-admin";

export default function AdminDashboardPage() {
  const { data, isLoading } = useAdminStats();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Overview"
        subtitle="Platform statistics at a glance"
      />

      <AdminStatsGrid stats={data?.stats} isLoading={isLoading} />

      <div className="grid gap-2">
        <Button asChild variant="outline" className="h-11 rounded-xl justify-between">
          <Link href="/admin/listings">
            Manage listings
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-11 rounded-xl justify-between">
          <Link href="/admin/users">
            Manage users
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
