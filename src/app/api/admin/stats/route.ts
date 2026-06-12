import { NextResponse } from "next/server";

import { handleRouteError } from "@/lib/api/handle-route-error";
import { requireAdmin } from "@/lib/auth/require-admin";
import { getAdminStats } from "@/services/admin";

export async function GET() {
  try {
    await requireAdmin();
    const stats = await getAdminStats();
    return NextResponse.json({ stats });
  } catch (error) {
    return handleRouteError(error, "Admin stats error");
  }
}
