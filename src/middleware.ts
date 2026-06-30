import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";
import { rateLimit, SECURITY_HEADERS } from "@/lib/security";

const intlMiddleware = createMiddleware(routing);

const protectedRoutes = ["/dashboard", "/admin"];
const authRoutes = ["/login", "/signup"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Static assets from /public (worker, fonts, etc.)
  if (/\.(?:mjs|js|wasm|css|woff2?|map)$/.test(pathname)) {
    return NextResponse.next();
  }

  // API routes: rate limit + security headers only (skip i18n)
  if (pathname.startsWith("/api/")) {
    const rateLimitResponse = rateLimit(request);
    if (rateLimitResponse) return rateLimitResponse;

    const response = NextResponse.next();
    Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    return response;
  }

  const response = intlMiddleware(request);

  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  const pathWithoutLocale = pathname.replace(/^\/(en|es|fr|de|ja)/, "") || "/";

  if (protectedRoutes.some((route) => pathWithoutLocale.startsWith(route))) {
    const sessionCookie = request.cookies.get("better-auth.session_token");
    if (!sessionCookie) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  if (authRoutes.some((route) => pathWithoutLocale.startsWith(route))) {
    const sessionCookie = request.cookies.get("better-auth.session_token");
    if (sessionCookie) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|pdf\\.worker\\.min\\.mjs|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|mjs|wasm)$).*)",
  ],
};
