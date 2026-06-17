import { NextResponse } from "next/server";

import { handleRouteError } from "@/lib/api/handle-route-error";

export const maxDuration = 300;
import { requireAdmin } from "@/lib/auth/require-admin";
import { adminBroadcastSchema } from "@/schemas/admin";
import {
  getBroadcastRecipientCount,
  sendBroadcastToAllUsers,
} from "@/services/broadcast";

export async function GET() {
  try {
    await requireAdmin();
    const recipients = await getBroadcastRecipientCount();

    return NextResponse.json({ recipients });
  } catch (error) {
    return handleRouteError(error, "Admin broadcast preview error");
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body = adminBroadcastSchema.parse(await request.json());
    const result = await sendBroadcastToAllUsers(body.message);

    return NextResponse.json({ success: true, result }, { status: 201 });
  } catch (error) {
    return handleRouteError(error, "Admin broadcast error");
  }
}
