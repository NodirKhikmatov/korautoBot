"use client";

import Link from "next/link";
import { Loader2, ShieldAlert } from "lucide-react";

import { AuthGate } from "@/components/auth/auth-gate";
import { Button } from "@/components/ui/button";
import { useAdminAccess } from "@/hooks/use-admin";

function AdminAccessCheck({ children }: { children: React.ReactNode }) {
  const { data, isLoading, isError } = useAdminAccess();

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !data?.isAdmin) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 px-6 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10">
          <ShieldAlert className="h-7 w-7 text-destructive" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">Admin access required</h2>
          <p className="text-sm text-muted-foreground">
            Your account does not have permission to view this area.
          </p>
        </div>
        <Button asChild variant="outline" className="rounded-xl">
          <Link href="/">Back to app</Link>
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}

export function AdminGate({ children }: { children: React.ReactNode }) {
  return (
    <AuthGate message="Sign in with Telegram to access the admin dashboard">
      <AdminAccessCheck>{children}</AdminAccessCheck>
    </AuthGate>
  );
}
