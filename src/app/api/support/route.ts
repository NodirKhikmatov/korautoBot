import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { handleRouteError } from "@/lib/api/handle-route-error";
import { requireAuth } from "@/lib/auth/require-auth";
import { defaultLocale, isLocale, LOCALE_COOKIE } from "@/i18n/config";
import { supportMessageSchema } from "@/schemas/support";
import { sendSupportMessageToAdmins } from "@/services/admin-support";

export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    const body = supportMessageSchema.parse(await request.json());
    const cookieStore = await cookies();
    const cookieLocale = cookieStore.get(LOCALE_COOKIE)?.value;
    const locale =
      cookieLocale && isLocale(cookieLocale) ? cookieLocale : defaultLocale;

    const result = await sendSupportMessageToAdmins(
      user,
      body.message,
      locale,
    );

    return NextResponse.json(
      { success: true, deliveredTo: result.deliveredTo },
      { status: 201 },
    );
  } catch (error) {
    return handleRouteError(error, "Support message error");
  }
}
