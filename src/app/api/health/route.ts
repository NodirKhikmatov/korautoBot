import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";

import { db } from "@/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await db.execute(sql`SELECT 1`);
    return NextResponse.json({
      status: "ok",
      database: "ok",
      timestamp: Date.now(),
    });
  } catch {
    return NextResponse.json(
      {
        status: "degraded",
        database: "error",
        timestamp: Date.now(),
      },
      { status: 503 },
    );
  }
}
