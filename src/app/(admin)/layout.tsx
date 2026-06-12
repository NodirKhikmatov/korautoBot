"use client";

import { AdminGate } from "@/components/admin/admin-gate";
import { AdminNav } from "@/components/admin/admin-nav";
import { useTelegramTheme } from "@/hooks/use-telegram-theme";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useTelegramTheme();

  return (
    <AdminGate>
      <div className="relative min-h-dvh bg-background">
        <div
          className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/8 via-background to-background"
          aria-hidden
        />
        <div
          className="mx-auto max-w-lg px-4 pb-8"
          style={{ paddingBottom: "max(2rem, env(safe-area-inset-bottom))" }}
        >
          <AdminNav />
          <main className="mt-4 space-y-6">{children}</main>
        </div>
      </div>
    </AdminGate>
  );
}
