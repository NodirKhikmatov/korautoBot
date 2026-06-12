"use client";

import { QueryProvider } from "./query-provider";
import { TelegramProvider } from "./telegram-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <TelegramProvider>{children}</TelegramProvider>
    </QueryProvider>
  );
}
