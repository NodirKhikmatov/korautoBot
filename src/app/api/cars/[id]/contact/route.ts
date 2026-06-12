import { NextResponse } from "next/server";

import { handleRouteError } from "@/lib/api/handle-route-error";
import { handleAuthRouteError } from "@/lib/auth/handle-auth-route-error";
import { requireAuth } from "@/lib/auth/require-auth";
import { recordCarContact } from "@/services/car-analytics";
import { getCarById } from "@/services/cars";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(_request: Request, context: RouteContext) {
  try {
    const user = await requireAuth();
    const { id } = await context.params;
    const car = await getCarById(id);

    if (!car || !car.isActive) {
      return NextResponse.json({ error: "Car not found" }, { status: 404 });
    }

    if (user.id === car.userId) {
      return NextResponse.json({
        recorded: false,
        viewCount: car.viewCount,
        contactCount: car.contactCount,
      });
    }

    const result = await recordCarContact(id, user.id);

    return NextResponse.json(result);
  } catch (error) {
    return handleAuthRouteError(error, "Record car contact error");
  }
}
