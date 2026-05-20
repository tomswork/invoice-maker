import { NextRequest, NextResponse } from "next/server";
import {
  AUTH_COOKIE_NAME,
  isAuthEnabled,
  isValidAuthCookie,
} from "@/lib/site-auth";

export async function proxy(request: NextRequest) {
  if (!isAuthEnabled()) {
    return NextResponse.next();
  }

  if (
    request.nextUrl.pathname === "/login" ||
    request.nextUrl.pathname.startsWith("/api/auth")
  ) {
    return NextResponse.next();
  }

  const cookie = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const authed = await isValidAuthCookie(cookie);

  if (authed) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("from", request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    "/((?!_next|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|css|js|map|woff|woff2)$).*)",
  ],
};
