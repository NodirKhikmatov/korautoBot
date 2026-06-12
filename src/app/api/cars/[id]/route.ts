import { NextResponse } from "next/server";

import { handleAuthRouteError } from "@/lib/auth/handle-auth-route-error";
import { requireAuth } from "@/lib/auth/require-auth";
import { getCarById, softDeleteCar } from "@/services/cars";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const car = await getCarById(id);

    if (!car || !car.isActive) {
      return NextResponse.json({ error: "Car not found" }, { status: 404 });
    }

    return NextResponse.json({ car });
  } catch (error) {
    console.error("Get car error:", error);
    return NextResponse.json(
      { error: "Failed to fetch car" },
      { status: 500 },
    );
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
