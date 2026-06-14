"use client";

import { Headphones, Loader2, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { AuthGate } from "@/components/auth/auth-gate";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ApiError, apiFetch } from "@/lib/api/fetch";
import { cn } from "@/lib/utils";

export function AdminSupportForm({ className }: { className?: string }) {
  const t = useTranslations("settings");
  const tCommon = useTranslations("common");
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  function handleOpen() {
    setSuccess(false);
    setError(null);
    setOpen(true);
  }

  async function handleSubmit() {
    const trimmed = message.trim();
    if (!trimmed || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await apiFetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
      });

      setSuccess(true);
      setOpen(false);
      setMessage("");
      window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred("success");
    } catch (err) {
      const messageText =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : t("supportSendFailed");
      setError(messageText);
      window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred("error");
    } finally {
      setIsSubmitting(false);
    }
  }

  const supportModal = open ? (
    <div
      className="fixed inset-0 z-[200] flex items-end justify-center bg-black/50 p-4 pb-[calc(4rem+env(safe-area-inset-bottom,0px)+0.75rem)] sm:items-center sm:pb-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-support-title"
    >
      <div className="max-h-[min(85dvh,calc(var(--tg-viewport-height,100dvh)-8rem))] w-full max-w-md overflow-y-auto rounded-2xl border bg-background p-4 shadow-lg sm:max-h-[85dvh]">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="space-y-1">
            <h3 id="admin-support-title" className="font-semibold">
              {t("supportTitle")}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t("supportDescription")}
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="shrink-0 rounded-xl"
            onClick={() => setOpen(false)}
            disabled={isSubmitting}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <Textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder={t("supportPlaceholder")}
          rows={5}
          maxLength={2000}
          disabled={isSubmitting}
          className="mb-4 resize-none rounded-xl"
        />

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1 rounded-xl"
            onClick={() => setOpen(false)}
            disabled={isSubmitting}
          >
            {tCommon("cancel")}
          </Button>
          <Button
            type="button"
            className="flex-1 rounded-xl font-semibold"
            onClick={handleSubmit}
            disabled={isSubmitting || !message.trim()}
          >
            {isSubmitting ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              t("supportSend")
            )}
          </Button>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <AuthGate messageKey="signInToContinue">
      <div className={cn("space-y-2", className)}>
        <Button
          type="button"
          variant="outline"
          className="w-full rounded-xl"
          onClick={handleOpen}
          disabled={isSubmitting}
        >
          <Headphones className="h-4 w-4" />
          {t("supportButton")}
        </Button>

        {success && (
          <p className="text-center text-sm text-muted-foreground">
            {t("supportSent")}
          </p>
        )}

        {error && !open && (
          <p className="text-center text-sm text-destructive">{error}</p>
        )}
      </div>

      {mounted ? createPortal(supportModal, document.body) : null}
    </AuthGate>
  );
}
