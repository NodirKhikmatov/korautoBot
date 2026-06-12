"use client";

import { BottomNav } from "@/components/layout/bottom-nav";
import { useTelegramTheme } from "@/hooks/use-telegram-theme";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useTelegramTheme();

  return (
    <div className="relative min-h-dvh bg-background">
      <div
        className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/8 via-background to-background"
        aria-hidden
      />
      <main
        className="mx-auto max-w-lg px-4 pb-24 pt-4"
        style={{ paddingTop: "max(1rem, env(safe-area-inset-top))" }}
      >
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
