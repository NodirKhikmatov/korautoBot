import { randomUUID } from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { handleRouteError } from "@/lib/api/handle-route-error";
import {
  VIEWER_COOKIE,
  VIEWER_COOKIE_MAX_AGE_SECONDS,
} from "@/lib/analytics/viewer-cookie";
import { getSessionUserId } from "@/lib/auth/session";
import { recordCarView } from "@/services/car-analytics";
import { getCarById } from "@/services/cars";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const car = await getCarById(id);

    if (!car || !car.isActive) {
      return NextResponse.json({ error: "Car not found" }, { status: 404 });
    }

    const sessionUserId = await getSessionUserId();

    if (sessionUserId === car.userId) {
      return NextResponse.json({
        recorded: false,
        viewCount: car.viewCount,
        contactCount: car.contactCount,
      });
    }

    const cookieStore = await cookies();
    let anonymousViewerId = cookieStore.get(VIEWER_COOKIE)?.value;
    const shouldSetViewerCookie = !sessionUserId && !anonymousViewerId;

    if (!anonymousViewerId) {
      anonymousViewerId = randomUUID();
    }

    const viewerKey = sessionUserId
      ? `user:${sessionUserId}`
      : `anon:${anonymousViewerId}`;

    const result = await recordCarView(id, viewerKey);

    const response = NextResponse.json(result);

    if (shouldSetViewerCookie) {
      response.cookies.set(VIEWER_COOKIE, anonymousViewerId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: VIEWER_COOKIE_MAX_AGE_SECONDS,
      });
    }

    return response;
  } catch (error) {
    return handleRouteError(
      error,
      "Record car view error",
      "Failed to record view",
    );
  }
}
