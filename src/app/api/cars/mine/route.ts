import { NextResponse } from "next/server";

import { handleRouteError } from "@/lib/api/handle-route-error";
import { requireAuth } from "@/lib/auth/require-auth";
import { getUserCars } from "@/services/cars";

export async function GET() {
  try {
    const user = await requireAuth();
    const cars = await getUserCars(user.id);

    return NextResponse.json({ cars });
  } catch (error) {
    return handleRouteError(error, "Get user cars error");
  }
}
