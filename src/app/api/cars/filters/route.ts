import { NextResponse } from "next/server";

import { carFilterOptionsSchema } from "@/schemas/car";
import { getCarFilterOptions } from "@/services/cars";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const { brand } = carFilterOptionsSchema.parse({
      brand: searchParams.get("brand") ?? undefined,
    });

    const options = await getCarFilterOptions(brand);

    return NextResponse.json(
      { options },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      },
    );
  } catch (error) {
    console.error("Get car filter options error:", error);
    return NextResponse.json(
      { error: "Failed to fetch filter options" },
      { status: 500 },
    );
  }
}
