import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { handleRouteError } from "@/lib/api/handle-route-error";
import { requireAuth } from "@/lib/auth/require-auth";
import { isLocale, LOCALE_COOKIE, defaultLocale } from "@/i18n/config";
import { contactSellerSchema } from "@/schemas/messaging";
import { contactSeller } from "@/services/messaging";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const user = await requireAuth();
    const { id } = await context.params;
    const body = contactSellerSchema.parse(await request.json());
    const cookieStore = await cookies();
    const cookieLocale = cookieStore.get(LOCALE_COOKIE)?.value;
    const locale =
      cookieLocale && isLocale(cookieLocale) ? cookieLocale : defaultLocale;
    const result = await contactSeller(user, id, body.message, locale);

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return handleRouteError(error, "Contact seller error");
  }
}
