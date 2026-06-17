import { NextResponse } from "next/server";

import { handleRouteError } from "@/lib/api/handle-route-error";
import { requireAuth } from "@/lib/auth/require-auth";
import { updateProfileSchema } from "@/schemas/user";
import { updateUserPhone } from "@/services/users";

export async function PATCH(request: Request) {
  try {
    const user = await requireAuth();
    const body = updateProfileSchema.parse(await request.json());
    const updated = await updateUserPhone(user.id, body.phone);

    return NextResponse.json({ user: updated });
  } catch (error) {
    return handleRouteError(error, "Update profile error");
  }
}
