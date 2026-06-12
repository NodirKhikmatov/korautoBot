import { NextResponse } from "next/server";

import { handleRouteError } from "@/lib/api/handle-route-error";
import { requireAdmin } from "@/lib/auth/require-admin";
import { adminUpdateCarSchema } from "@/schemas/admin";
import {
  adminDeleteCar,
  adminGetCar,
  adminUpdateCar,
} from "@/services/admin";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    await requireAdmin();
    const { id } = await context.params;
    const car = await adminGetCar(id);

    if (!car) {
      return NextResponse.json({ error: "Car not found" }, { status: 404 });
    }

    return NextResponse.json({ car });
  } catch (error) {
    return handleRouteError(error, "Admin get car error");
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    await requireAdmin();
    const { id } = await context.params;
    const body = await request.json();
    const input = adminUpdateCarSchema.parse(body);
    const car = await adminUpdateCar(id, input);

    return NextResponse.json({ car });
  } catch (error) {
    return handleRouteError(error, "Admin update car error");
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    await requireAdmin();
    const { id } = await context.params;
    await adminDeleteCar(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleRouteError(error, "Admin delete car error");
  }
}
