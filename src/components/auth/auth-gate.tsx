"use client";

import { Loader2, LogIn } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

export function AuthGate({
  children,
  message = "Sign in with Telegram to continue",
}: {
  children: React.ReactNode;
  message?: string;
}) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 px-6 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
          <LogIn className="h-7 w-7 text-primary" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">Authentication required</h2>
          <p className="text-sm text-muted-foreground">{message}</p>
        </div>
        <Button
          variant="outline"
          className="rounded-xl"
          onClick={() => window.Telegram?.WebApp?.close()}
        >
          Open in Telegram
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}
