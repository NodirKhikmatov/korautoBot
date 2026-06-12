import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth/get-current-user";
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
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    await softDeleteCar(id, user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete car error:", error);
    return NextResponse.json(
      { error: "Failed to delete car listing" },
      { status: 500 },
    );
  }
}
