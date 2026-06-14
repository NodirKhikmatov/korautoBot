"use client";

import { Loader2, Megaphone } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAdminBroadcast } from "@/hooks/use-admin";
import { cn } from "@/lib/utils";

export function AdminBroadcastForm({ className }: { className?: string }) {
  const t = useTranslations("admin");
  const { recipients, isLoadingRecipients, broadcast, isBroadcasting } =
    useAdminBroadcast();
  const [message, setMessage] = useState("");
  const [result, setResult] = useState<{
    total: number;
    sent: number;
    failed: number;
    notStarted: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    const trimmed = message.trim();
    if (!trimmed || isBroadcasting) {
      return;
    }

    const confirmed = window.confirm(t("broadcastConfirm"));
    if (!confirmed) {
      return;
    }

    setError(null);
    setResult(null);

    try {
      const response = await broadcast(trimmed);
      setResult(response.result);
      setMessage("");
      window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred("success");
    } catch (err) {
      const messageText =
        err instanceof Error ? err.message : t("broadcastFailed");
      setError(messageText);
      window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred("error");
    }
  }

  return (
    <div
      className={cn(
        "space-y-4 rounded-2xl border border-border/60 bg-card p-4",
        className,
      )}
    >
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Megaphone className="h-4 w-4 text-primary" />
          <h2 className="font-semibold">{t("broadcastTitle")}</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          {t("broadcastDescription")}
        </p>
        <p className="text-xs text-muted-foreground">
          {isLoadingRecipients
            ? t("broadcastLoadingRecipients")
            : t("broadcastRecipients", { count: recipients })}
        </p>
      </div>

      <Textarea
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        placeholder={t("broadcastPlaceholder")}
        rows={5}
        maxLength={4000}
        disabled={isBroadcasting}
        className="resize-none rounded-xl"
      />

      <Button
        type="button"
        className="w-full rounded-xl font-semibold"
        onClick={handleSubmit}
        disabled={isBroadcasting || !message.trim() || recipients === 0}
      >
        {isBroadcasting ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <Megaphone className="h-5 w-5" />
        )}
        {t("broadcastSend")}
      </Button>

      {result && (
        <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm">
          <p className="font-medium">{t("broadcastSuccess")}</p>
          <p className="mt-1 text-muted-foreground">
            {t("broadcastResult", {
              total: result.total,
              sent: result.sent,
              notStarted: result.notStarted,
              failed: result.failed,
            })}
          </p>
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
