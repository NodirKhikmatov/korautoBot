"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

const INSURANCE_START_PARAM = "insurance";
const INSURANCE_PATH = "/tools/insurance";

export function TelegramStartRedirect() {
  const router = useRouter();
  const pathname = usePathname();
  const handledRef = useRef(false);

  useEffect(() => {
    if (handledRef.current || pathname === INSURANCE_PATH) {
      return;
    }

    const startParam = window.Telegram?.WebApp?.initDataUnsafe?.start_param;

    if (startParam === INSURANCE_START_PARAM) {
      handledRef.current = true;
      router.replace(INSURANCE_PATH);
    }
  }, [pathname, router]);

  return null;
}
