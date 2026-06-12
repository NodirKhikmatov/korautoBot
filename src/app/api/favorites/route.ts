import { NextResponse } from "next/server";
import { z } from "zod";

import { handleAuthRouteError } from "@/lib/auth/handle-auth-route-error";
import { requireAuth } from "@/lib/auth/require-auth";
import {
  addFavorite,
  getUserFavorites,
  removeFavorite,
} from "@/services/favorites";

const favoriteSchema = z.object({
  carId: z.string().uuid(),
});

export async function GET() {
  try {
    const user = await requireAuth();
    const favorites = await getUserFavorites(user.id);

    return NextResponse.json({ favorites });
  } catch (error) {
    return handleAuthRouteError(error, "Get favorites error");
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const { carId } = favoriteSchema.parse(body);

    await addFavorite(user.id, carId);

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    return handleAuthRouteError(error, "Add favorite error");
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const { carId } = favoriteSchema.parse(body);

    await removeFavorite(user.id, carId);

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleAuthRouteError(error, "Remove favorite error");
  }
}
