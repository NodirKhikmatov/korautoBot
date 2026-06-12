import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import {
  PROTECTED_API_ROUTES,
  PROTECTED_PAGE_ROUTES,
  SESSION_COOKIE,
} from "@/lib/auth/constants";
import { verifySessionTokenEdge } from "@/lib/auth/session-token-edge";

function isProtectedApiRoute(pathname: string, method: string): boolean {
  return PROTECTED_API_ROUTES.some(
    (route) =>
      route.pattern.test(pathname) &&
      route.methods.includes(method.toUpperCase()),
  );
}

function isProtectedPageRoute(pathname: string): boolean {
  return PROTECTED_PAGE_ROUTES.some((pattern) => pattern.test(pathname));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const method = request.method;

  const requiresAuth =
    isProtectedApiRoute(pathname, method) || isProtectedPageRoute(pathname);

  if (!requiresAuth) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const userId = token ? await verifySessionTokenEdge(token) : null;

  if (!userId) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const loginUrl = new URL("/", request.url);
    loginUrl.searchParams.set("auth", "required");
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/api/upload",
    "/api/favorites",
    "/api/cars",
    "/api/cars/mine",
    "/api/cars/:id*",
    "/create",
  ],
};
