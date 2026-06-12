import { NextResponse } from "next/server";

import { handleRouteError } from "@/lib/api/handle-route-error";
import { requireAdmin } from "@/lib/auth/require-admin";
import { adminListQuerySchema } from "@/schemas/admin";
import { listAdminCars } from "@/services/admin";

export async function GET(request: Request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const query = adminListQuerySchema.parse({
      page: searchParams.get("page") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
      search: searchParams.get("search") ?? undefined,
    });

    const result = await listAdminCars(query.page, query.limit, query.search);

    return NextResponse.json(result);
  } catch (error) {
    return handleRouteError(error, "Admin list cars error");
  }
}
