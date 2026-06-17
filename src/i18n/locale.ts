"use client";

import { useRouter } from "next/navigation";

import { LOCALE_COOKIE, type Locale } from "./config";

export function setLocaleCookie(locale: Locale) {
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=31536000; SameSite=Lax`;
}

export function useChangeLocale() {
  const router = useRouter();

  return (locale: Locale) => {
    setLocaleCookie(locale);
    router.refresh();
  };
}
