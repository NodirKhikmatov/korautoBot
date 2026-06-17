"use client";

import { DevAuthPrompt } from "@/components/auth/dev-auth-prompt";
import { BottomNav } from "@/components/layout/bottom-nav";
import { BotStartBanner } from "@/components/notifications/bot-start-banner";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-dvh bg-background">
      <div
        className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/8 via-background to-background"
        aria-hidden
      />
      <main
        className="mx-auto w-full max-w-lg px-4 pb-24 pt-4 sm:px-6 md:max-w-xl"
        style={{ paddingTop: "max(1rem, env(safe-area-inset-top))" }}
      >
        <DevAuthPrompt />
        <BotStartBanner />
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
