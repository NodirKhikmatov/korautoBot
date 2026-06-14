const PHONE_MIN_DIGITS = 7;
const PHONE_MAX_DIGITS = 15;

export function normalizePhone(phone: string): string {
  const trimmed = phone.trim();
  const hasPlus = trimmed.startsWith("+");
  const digits = trimmed.replace(/\D/g, "");
  return hasPlus ? `+${digits}` : digits;
}

export function isValidPhone(phone: string): boolean {
  const digits = normalizePhone(phone).replace(/\D/g, "");
  return digits.length >= PHONE_MIN_DIGITS && digits.length <= PHONE_MAX_DIGITS;
}

export function getPhoneContactUrl(phone: string): string {
  const normalized = normalizePhone(phone);
  if (!normalized) {
    return "";
  }

  return `tel:${normalized}`;
}

export function formatPhoneDisplay(phone: string): string {
  return normalizePhone(phone);
}

export function openPhoneContact(phone: string): boolean {
  const url = getPhoneContactUrl(phone);
  if (!url) {
    return false;
  }

  const webApp = window.Telegram?.WebApp;

  if (webApp?.openLink) {
    webApp.openLink(url);
  } else {
    window.location.href = url;
  }

  webApp?.HapticFeedback?.impactOccurred("light");
  return true;
}
