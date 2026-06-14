"use client";

import { Loader2, MessageCircle, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { AuthGate } from "@/components/auth/auth-gate";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useContactSeller } from "@/hooks/use-contact-seller";
import { cn } from "@/lib/utils";

export function ContactSellerButton({
  carId,
  carTitle,
  username,
  phone,
  className,
  size = "lg",
  fullWidth = true,
}: {
  carId: string;
  carTitle: string;
  username?: string | null;
  phone?: string | null;
  className?: string;
  size?: "default" | "lg" | "sm";
  fullWidth?: boolean;
}) {
  const t = useTranslations("seller");
  const tCommon = useTranslations("common");
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);
  const {
    hasDirectChat,
    openDirectChat,
    sendInquiry,
    isSubmitting,
    error,
    clearError,
  } = useContactSeller(carId, username, phone);

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

  async function handleDirectContact() {
    setSuccess(false);
    clearError();
    await openDirectChat();
  }

  function handleOpenInquiry() {
    setSuccess(false);
    clearError();
    setOpen(true);
  }

  async function handleSubmit() {
    const trimmed = message.trim();
    if (!trimmed || isSubmitting) {
      return;
    }

    clearError();

    try {
      await sendInquiry(trimmed);
      setSuccess(true);
      setOpen(false);
      setMessage("");
    } catch {
      // Error state handled in hook
    }
  }

  const inquiryModal =
    open && !hasDirectChat ? (
      <div
        className="fixed inset-0 z-[200] flex items-end justify-center bg-black/50 p-4 pb-[calc(4rem+env(safe-area-inset-bottom,0px)+0.75rem)] sm:items-center sm:pb-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="contact-seller-title"
      >
        <div className="max-h-[min(85dvh,calc(var(--tg-viewport-height,100dvh)-8rem))] w-full max-w-md overflow-y-auto rounded-2xl border bg-background p-4 shadow-lg sm:max-h-[85dvh]">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div className="space-y-1">
              <h3 id="contact-seller-title" className="font-semibold">
                {t("contactSeller")}
              </h3>
              <p className="text-sm text-muted-foreground">{carTitle}</p>
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

          <p className="mb-3 text-sm text-muted-foreground">
            {t("inquiryHint")}
          </p>

          <Textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder={t("inquiryPlaceholder")}
            rows={4}
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
                t("sendInquiry")
              )}
            </Button>
          </div>
        </div>
      </div>
    ) : null;

  return (
    <AuthGate messageKey="signInToContinue">
      <div className="space-y-2">
        <Button
          type="button"
          size={size}
          className={cn(
            "rounded-xl font-semibold",
            fullWidth && "w-full",
            size === "lg" && "h-12 text-base",
            className,
          )}
          onClick={hasDirectChat ? handleDirectContact : handleOpenInquiry}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <MessageCircle className="h-5 w-5" />
          )}
          {t("contactSeller")}
        </Button>

        {success && (
          <p className="text-center text-sm text-muted-foreground">
            {t("inquirySent")}
          </p>
        )}

        {error && (
          <p className="text-center text-sm text-destructive">{error}</p>
        )}
      </div>

      {mounted ? createPortal(inquiryModal, document.body) : null}
    </AuthGate>
  );
}
