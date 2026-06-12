import { NextResponse } from "next/server";

import { handleRouteError } from "@/lib/api/handle-route-error";
import { requireAdmin } from "@/lib/auth/require-admin";
import { adminFeatureCarSchema } from "@/schemas/admin";
import { adminSetCarFeatured } from "@/services/admin";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, context: RouteContext) {
  try {
    await requireAdmin();
    const { id } = await context.params;
    const body = await request.json();
    const { isFeatured } = adminFeatureCarSchema.parse(body);

    await adminSetCarFeatured(id, isFeatured);

    return NextResponse.json({ success: true, isFeatured });
  } catch (error) {
    return handleRouteError(error, "Admin feature car error");
  }
}
