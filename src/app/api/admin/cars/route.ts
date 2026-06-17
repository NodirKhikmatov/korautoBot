import { NextResponse } from "next/server";

import { handleRouteError } from "@/lib/api/handle-route-error";
import { requireAdmin } from "@/lib/auth/require-admin";
import { adminCreateCarSchema, adminListQuerySchema } from "@/schemas/admin";
import { adminCreateCar, listAdminCars } from "@/services/admin";

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

export async function POST(request: Request) {
  try {
    const admin = await requireAdmin();
    const body = await request.json();
    const input = adminCreateCarSchema.parse(body);
    const car = await adminCreateCar(admin.id, input);

    return NextResponse.json({ car }, { status: 201 });
  } catch (error) {
    return handleRouteError(error, "Admin create car error", "Failed to create listing");
  }
}
