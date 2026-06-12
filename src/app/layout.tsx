import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { TelegramScript } from "@/components/telegram/telegram-script";
import { APP_NAME } from "@/lib/constants";
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

export const metadata: Metadata = {
  title: APP_NAME,
  description: "Marketplace for buying and selling used cars in South Korea",
};

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {r2Origin ? (
          <link rel="preconnect" href={r2Origin} crossOrigin="anonymous" />
        ) : null}
        <TelegramScript />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
