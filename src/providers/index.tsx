"use client";

import { QueryProvider } from "./query-provider";
import { TelegramProvider } from "./telegram-provider";
import { ThemeProvider } from "./theme-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <QueryProvider>
        <TelegramProvider>{children}</TelegramProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}
