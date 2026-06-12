import { NextResponse } from "next/server";

import { handleRouteError } from "@/lib/api/handle-route-error";
import { getFeaturedCars } from "@/services/cars";

export async function GET() {
  try {
    const cars = await getFeaturedCars(6);
    return NextResponse.json(
      { cars },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
        },
      },
    );
  } catch (error) {
    return handleRouteError(
      error,
      "Get featured cars error",
      "Failed to fetch featured cars",
    );
  }
}
