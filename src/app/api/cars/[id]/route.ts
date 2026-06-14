import { NextResponse } from "next/server";

import { handleRouteError } from "@/lib/api/handle-route-error";
import { handleAuthRouteError } from "@/lib/auth/handle-auth-route-error";
import { requireAuth } from "@/lib/auth/require-auth";
import { isListingSold } from "@/lib/listing/status";
import { getCarById, softDeleteCar } from "@/services/cars";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const car = await getCarById(id);

    if (!car) {
      return NextResponse.json({ error: "Car not found" }, { status: 404 });
    }

    const sold = isListingSold(car);

    if (!car.isActive && !sold) {
      return NextResponse.json({ error: "Car not found" }, { status: 404 });
    }

    return NextResponse.json(
      { car },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
        },
      },
    );
  } catch (error) {
    return handleRouteError(error, "Get car error", "Failed to fetch car");
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const user = await requireAuth();
    const { id } = await context.params;
    await softDeleteCar(id, user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleAuthRouteError(error, "Delete car error");
  }
}
