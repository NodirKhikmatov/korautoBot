import { NextResponse } from "next/server";

import { handleRouteError } from "@/lib/api/handle-route-error";
import { requireAuth } from "@/lib/auth/require-auth";
import { favoriteCheckSchema } from "@/schemas/favorite";
import { getFavoriteStatusForCars } from "@/services/favorites";

export async function GET(request: Request) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const { carIds } = favoriteCheckSchema.parse({
      carIds: searchParams.get("carIds") ?? "",
    });

    const status = await getFavoriteStatusForCars(user.id, carIds);

    return NextResponse.json({ status }, {
      headers: {
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    return handleRouteError(error, "Check favorites error");
  }
}
