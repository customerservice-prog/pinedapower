import { NextRequest, NextResponse } from "next/server";
import { COOKIE_NAME } from "@/lib/session";

// Railway (and most reverse proxies) forward requests to this container
// using an internal address such as localhost:8080. request.url reflects
// that internal host, not the public domain, so we must prefer the
// X-Forwarded-Host / X-Forwarded-Proto headers when building absolute
// redirect URLs, or users get redirected to a broken internal address
// (see app/api/auth/login/route.ts, which had the same fix applied).
function getPublicOrigin(request: NextRequest): string {
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto") ?? "https";
  const host = forwardedHost ?? request.headers.get("host");
  if (host) {
    return `${forwardedProto}://${host}`;
  }
  return new URL(request.url).origin;
}

export async function POST(request: NextRequest) {
  const url = new URL("/login", getPublicOrigin(request));
  const response = NextResponse.redirect(url, { status: 303 });
  response.cookies.set(COOKIE_NAME, "", { path: "/", maxAge: 0 });
  return response;
}
