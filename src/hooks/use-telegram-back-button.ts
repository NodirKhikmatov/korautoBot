"use client";

import { useEffect } from "react";

export function useTelegramBackButton(onBack: () => void) {
  useEffect(() => {
    const backButton = window.Telegram?.WebApp?.BackButton;
    if (!backButton) return;

    backButton.show();
    backButton.onClick(onBack);

    return () => {
      backButton.offClick(onBack);
      backButton.hide();
    };
  }, [onBack]);
}
