import { NextResponse } from "next/server";

import { handleRouteError } from "@/lib/api/handle-route-error";
import { requireAuth } from "@/lib/auth/require-auth";
import { listingStatusSchema } from "@/schemas/listing-status";
import { updateListingStatus } from "@/services/listing-status";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const user = await requireAuth();
    const { id } = await context.params;
    const body = listingStatusSchema.parse(await request.json());
    const car = await updateListingStatus(id, user.id, body.status);

    return NextResponse.json({ car });
  } catch (error) {
    return handleRouteError(error, "Update listing status error");
  }
}
