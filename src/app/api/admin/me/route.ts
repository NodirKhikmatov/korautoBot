import { NextResponse } from "next/server";

import { handleRouteError } from "@/lib/api/handle-route-error";
import { isAdminUser } from "@/lib/auth/admin";
import { requireAuth } from "@/lib/auth/require-auth";

export async function GET() {
  try {
    const user = await requireAuth();

    return NextResponse.json({
      isAdmin: isAdminUser(user),
      user: {
        id: user.id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
  } catch (error) {
    return handleRouteError(error, "Admin me error");
  }
}
