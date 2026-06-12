import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages, getTranslations } from "next-intl/server";

import { TelegramScript } from "@/components/telegram/telegram-script";
import { getThemeInitScript } from "@/lib/theme/theme-init-script";
import { Providers } from "@/providers";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("common");

  return {
    title: t("appName"),
    description: t("appDescription"),
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

function getR2PreconnectOrigin(): string | undefined {
  const publicUrl = process.env.R2_PUBLIC_URL;

  if (!publicUrl) {
    return undefined;
  }

  try {
    return new URL(publicUrl).origin;
  } catch {
    return undefined;
  }
}

const r2Origin = getR2PreconnectOrigin();

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        {r2Origin ? (
          <link rel="preconnect" href={r2Origin} crossOrigin="anonymous" />
        ) : null}
        <TelegramScript />
        <script dangerouslySetInnerHTML={{ __html: getThemeInitScript() }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NextIntlClientProvider messages={messages}>
          <Providers>{children}</Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
