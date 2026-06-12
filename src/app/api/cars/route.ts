import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth/get-current-user";
import { carFiltersSchema, createCarSchema } from "@/schemas/car";
import { createCar, getCars } from "@/services/cars";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const rawFilters = Object.fromEntries(searchParams.entries());
    const filters = carFiltersSchema.parse(rawFilters);

    const result = await getCars(filters, filters.page, filters.limit);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Get cars error:", error);
    return NextResponse.json(
      { error: "Failed to fetch cars" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const input = createCarSchema.parse(body);

    const car = await createCar(user.id, input);

    return NextResponse.json({ car }, { status: 201 });
  } catch (error) {
    console.error("Create car error:", error);
    return NextResponse.json(
      { error: "Failed to create car listing" },
      { status: 500 },
    );
  }
}
