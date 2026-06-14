"use client";

import { Loader2, Phone } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { ApiError, apiFetch } from "@/lib/api/fetch";
import { formatPhoneDisplay } from "@/lib/contact/phone";
import { useAuthStore } from "@/stores/auth-store";
import type { User } from "@/types";
import { cn } from "@/lib/utils";

export function ContactSettings({ className }: { className?: string }) {
  const t = useTranslations("settings");
  const { user } = useAuth();
  const [phone, setPhone] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setPhone(user?.phone ?? "");
  }, [user?.phone]);

  if (!user) {
    return null;
  }

  async function handleSave() {
    setIsSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const { user: updated } = await apiFetch<{ user: User }>("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });

      useAuthStore.getState().setUser(updated);
      setPhone(updated.phone ?? "");
      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : t("phoneSaveFailed"),
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div
      className={cn(
        "space-y-3 rounded-2xl border border-border/60 bg-card/50 p-4",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
          <Phone className="h-5 w-5 text-primary" />
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          <p className="text-sm font-medium">{t("phone")}</p>
          <p className="text-xs text-muted-foreground">
            {t("phoneDescription")}
          </p>
        </div>
      </div>

      <Input
        type="tel"
        inputMode="tel"
        value={phone}
        onChange={(event) => {
          setPhone(event.target.value);
          setSuccess(false);
          setError(null);
        }}
        placeholder={t("phonePlaceholder")}
        className="h-11 rounded-xl"
        disabled={isSaving}
      />

      {user.phone && (
        <p className="text-xs text-muted-foreground">
          {t("phoneCurrent", { phone: formatPhoneDisplay(user.phone) })}
        </p>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}
      {success && (
        <p className="text-sm text-muted-foreground">{t("phoneSaved")}</p>
      )}

      <Button
        type="button"
        className="w-full rounded-xl"
        onClick={handleSave}
        disabled={isSaving}
      >
        {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : t("savePhone")}
      </Button>
    </div>
  );
}
