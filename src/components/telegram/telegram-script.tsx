/** Loads Telegram Web App SDK before theme init for correct first-paint colors. */
export function TelegramScript() {
  return (
    // eslint-disable-next-line @next/next/no-sync-scripts
    <script src="https://telegram.org/js/telegram-web-app.js" />
  );
}
