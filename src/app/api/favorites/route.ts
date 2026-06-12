import { NextResponse } from "next/server";

import { handleRouteError } from "@/lib/api/handle-route-error";
import { requireAuth } from "@/lib/auth/require-auth";
import { favoriteCarSchema } from "@/schemas/favorite";
import {
  addFavorite,
  getUserFavorites,
  removeFavorite,
} from "@/services/favorites";

export async function GET() {
  try {
    const user = await requireAuth();
    const result = await getUserFavorites(user.id);

    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    return handleRouteError(error, "Get favorites error");
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const { carId } = favoriteCarSchema.parse(body);

    await addFavorite(user.id, carId);

    return NextResponse.json({ success: true, carId }, { status: 201 });
  } catch (error) {
    return handleRouteError(error, "Add favorite error");
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const { carId } = favoriteCarSchema.parse(body);

    await removeFavorite(user.id, carId);

    return NextResponse.json({ success: true, carId });
  } catch (error) {
    return handleRouteError(error, "Remove favorite error");
  }
}
