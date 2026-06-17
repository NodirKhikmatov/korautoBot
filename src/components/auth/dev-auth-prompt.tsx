"use client";

import { Loader2, Monitor } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { canShowDevAuthPrompt } from "@/lib/auth/dev-auth-client";
import { useAuthStore } from "@/stores/auth-store";

export function DevAuthPrompt() {
  const t = useTranslations("auth");
  const { isAuthenticated, isLoading } = useAuth();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (isLoading || isAuthenticated || !canShowDevAuthPrompt()) {
    return null;
  }

  async function handleDevLogin() {
    setPending(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/dev-login", {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        throw new Error(data?.error ?? t("devLoginFailed"));
      }

      const { user } = await response.json();
      useAuthStore.getState().setUser(user);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("devLoginFailed"));
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mb-4 rounded-xl border border-dashed border-primary/30 bg-accent/50 p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/15">
          <Monitor className="h-4 w-4 text-primary" />
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <div>
            <p className="text-sm font-medium">{t("localBrowserTesting")}</p>
            <p className="text-xs text-muted-foreground">{t("devLoginHint")}</p>
          </div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="rounded-lg"
            disabled={pending}
            onClick={handleDevLogin}
          >
            {pending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {t("signingIn")}
              </>
            ) : (
              t("devLoginLocalhost")
            )}
          </Button>
          {error ? (
            <p className="text-xs text-destructive">{error}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
