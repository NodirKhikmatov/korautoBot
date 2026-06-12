import { NextResponse } from "next/server";

import { handleRouteError } from "@/lib/api/handle-route-error";
import { requireAdmin } from "@/lib/auth/require-admin";
import { adminBanUserSchema } from "@/schemas/admin";
import { adminSetUserBanned } from "@/services/admin";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const admin = await requireAdmin();
    const { id } = await context.params;
    const body = await request.json();
    const { banned } = adminBanUserSchema.parse(body);

    if (id === admin.id && banned) {
      return NextResponse.json(
        { error: "You cannot ban your own account" },
        { status: 400 },
      );
    }

    const user = await adminSetUserBanned(id, banned);

    return NextResponse.json({ user, banned });
  } catch (error) {
    return handleRouteError(error, "Admin ban user error");
  }
}
