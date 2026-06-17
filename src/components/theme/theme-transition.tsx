"use client";

import { useTheme } from "next-themes";
import { useEffect } from "react";

export function ThemeTransition() {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("theme-transition");

    const timeout = window.setTimeout(() => {
      root.classList.remove("theme-transition");
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [resolvedTheme]);

  return null;
}
