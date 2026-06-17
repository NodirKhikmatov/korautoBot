/** True when the app is opened on localhost (browser dev testing). */
export function isLocalDevHost(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  const host = window.location.hostname;
  return host === "localhost" || host === "127.0.0.1";
}

export function canShowDevAuthPrompt(): boolean {
  return isLocalDevHost() && !window.Telegram?.WebApp?.initData;
}
