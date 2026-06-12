"use client";

import { Loader2, LogIn } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { canShowDevAuthPrompt } from "@/lib/auth/dev-auth-client";
import { useAuthStore } from "@/stores/auth-store";

export function AuthGate({
  children,
  message = "Sign in with Telegram to continue",
}: {
  children: React.ReactNode;
  message?: string;
}) {
  const { isAuthenticated, isLoading } = useAuth();
  const [devPending, setDevPending] = useState(false);
  const [devError, setDevError] = useState<string | null>(null);
  const showDevLogin = canShowDevAuthPrompt();

  async function handleDevLogin() {
    setDevPending(true);
    setDevError(null);

    try {
      const response = await fetch("/api/auth/dev-login", {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        throw new Error(data?.error ?? "Dev login failed");
      }

      const { user } = await response.json();
      useAuthStore.getState().setUser(user);
    } catch (err) {
      setDevError(err instanceof Error ? err.message : "Dev login failed");
    } finally {
      setDevPending(false);
    }
  }

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
        {showDevLogin ? (
          <div className="flex w-full max-w-xs flex-col gap-2">
            <Button
              type="button"
              className="rounded-xl"
              disabled={devPending}
              onClick={handleDevLogin}
            >
              {devPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in…
                </>
              ) : (
                "Dev login (localhost)"
              )}
            </Button>
            {devError ? (
              <p className="text-xs text-destructive">{devError}</p>
            ) : null}
          </div>
        ) : (
          <Button
            variant="outline"
            className="rounded-xl"
            onClick={() => window.Telegram?.WebApp?.close()}
          >
            Open in Telegram
          </Button>
        )}
      </div>
    );
  }

  return <>{children}</>;
}
