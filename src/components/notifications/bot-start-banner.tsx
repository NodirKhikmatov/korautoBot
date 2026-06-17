"use client";

import { Bell, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { openTelegramBotChat } from "@/lib/telegram/bot-chat";
import { getTelegramBotChatUrl } from "@/lib/telegram/bot-api";
import { useAuthStore } from "@/stores/auth-store";
import { cn } from "@/lib/utils";

const DISMISS_KEY = "bot-start-banner-dismissed";

export function BotStartBanner({ className }: { className?: string }) {
  const t = useTranslations("common");
  const { isAuthenticated, user } = useAuth();
  const [dismissed, setDismissed] = useState(true);
  const botUrl = getTelegramBotChatUrl(
    process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME ?? "",
  );

  useEffect(() => {
    setDismissed(sessionStorage.getItem(DISMISS_KEY) === "1");
  }, []);

  useEffect(() => {
    async function refreshSession() {
      const response = await fetch("/api/auth/session", {
        credentials: "include",
      });

      if (!response.ok) {
        return;
      }

      const { user } = await response.json();
      useAuthStore.getState().setUser(user);
    }

    function handleVisible() {
      if (document.visibilityState === "visible") {
        void refreshSession();
      }
    }

    document.addEventListener("visibilitychange", handleVisible);
    return () => document.removeEventListener("visibilitychange", handleVisible);
  }, []);

  if (
    !isAuthenticated ||
    !user ||
    user.botStartedAt ||
    dismissed ||
    !botUrl
  ) {
    return null;
  }

  function handleOpenBot() {
    openTelegramBotChat(botUrl);
  }

  function handleDismiss() {
    sessionStorage.setItem(DISMISS_KEY, "1");
    setDismissed(true);
  }

  return (
    <div
      className={cn(
        "mb-4 rounded-2xl border border-primary/20 bg-primary/5 p-3",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <Bell className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
        <div className="min-w-0 flex-1 space-y-2">
          <p className="text-sm font-medium">{t("botStartTitle")}</p>
          <p className="text-xs text-muted-foreground">{t("botStartHint")}</p>
          <Button
            type="button"
            size="sm"
            className="h-9 rounded-xl"
            onClick={handleOpenBot}
          >
            {t("botStartAction")}
          </Button>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0 rounded-xl"
          onClick={handleDismiss}
          aria-label={t("dismiss")}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
