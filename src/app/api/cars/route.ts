import { NextResponse } from "next/server";

import { handleRouteError } from "@/lib/api/handle-route-error";
import { requireAuth } from "@/lib/auth/require-auth";
import { carFiltersSchema, createCarSchema, createListingSchema } from "@/schemas/car";
import { createCar, getCars } from "@/services/cars";
import { updateUserPhone } from "@/services/users";
import type { User } from "@/types";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const rawFilters = Object.fromEntries(searchParams.entries());
    const filters = carFiltersSchema.parse(rawFilters);

    const result = await getCars(filters, filters.page, filters.limit);

    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      },
    });
  } catch (error) {
    return handleRouteError(error, "Get cars error", "Failed to fetch cars");
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const input = createListingSchema.parse(body);
    const { phone, ...carData } = input;
    const parsedCar = createCarSchema.parse(carData);

    let currentUser: User = user;
    if (phone !== undefined) {
      currentUser = await updateUserPhone(user.id, phone);
    }

    const car = await createCar(currentUser.id, parsedCar);

    return NextResponse.json({ car, user: currentUser }, { status: 201 });
  } catch (error) {
    return handleRouteError(error, "Create car error");
  }
}
