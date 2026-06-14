import { getAdminTelegramIds } from "@/lib/auth/admin";
import { formatAdminSupportMessage } from "@/lib/messaging/format";
import { MessagingError } from "@/lib/messaging/errors";
import { sendTelegramMessage } from "@/lib/telegram/bot-api";
import type { Locale } from "@/i18n/config";
import type { User } from "@/types";

export async function sendSupportMessageToAdmins(
  user: User,
  message: string,
  locale?: Locale,
): Promise<{ deliveredTo: number }> {
  const adminIds = getAdminTelegramIds();

  if (adminIds.length === 0) {
    throw new MessagingError(
      "Support is not configured",
      503,
      "SUPPORT_NOT_CONFIGURED",
    );
  }

  const text = formatAdminSupportMessage(
    {
      user,
      message,
    },
    locale,
  );

  const results = await Promise.allSettled(
    adminIds.map((adminId) => sendTelegramMessage(adminId, text)),
  );

  const deliveredTo = results.filter((result) => result.status === "fulfilled")
    .length;

  if (deliveredTo === 0) {
    const firstError = results.find((result) => result.status === "rejected");

    if (
      firstError?.status === "rejected" &&
      firstError.reason instanceof MessagingError
    ) {
      throw firstError.reason;
    }

    throw new MessagingError(
      "Failed to deliver support message",
      502,
      "SUPPORT_SEND_FAILED",
    );
  }

  return { deliveredTo };
}
