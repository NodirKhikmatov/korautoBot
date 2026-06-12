import { NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentUser } from "@/lib/auth/get-current-user";
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
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const favorites = await getUserFavorites(user.id);

    return NextResponse.json({ favorites });
  } catch (error) {
    console.error("Get favorites error:", error);
    return NextResponse.json(
      { error: "Failed to fetch favorites" },
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
    const { carId } = favoriteSchema.parse(body);

    await addFavorite(user.id, carId);

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("Add favorite error:", error);
    return NextResponse.json(
      { error: "Failed to add favorite" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { carId } = favoriteSchema.parse(body);

    await removeFavorite(user.id, carId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Remove favorite error:", error);
    return NextResponse.json(
      { error: "Failed to remove favorite" },
      { status: 500 },
    );
  }
}
