import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";
import { rateLimit, SECURITY_HEADERS } from "@/lib/security";

const intlMiddleware = createMiddleware(routing);

const protectedRoutes = ["/dashboard", "/admin"];
const authRoutes = ["/login", "/signup"];

const METADATA_ROUTES = new Set([
  "/icon",
  "/apple-icon",
  "/opengraph-image",
  "/robots.txt",
  "/sitemap.xml",
  "/manifest.webmanifest",
  "/site.webmanifest",
  "/ads.txt",
  "/pdf.worker.min.mjs",
]);

function shouldSkipIntl(pathname: string): boolean {
  if (METADATA_ROUTES.has(pathname)) return true;
  if (/\.(?:mjs|js|wasm|css|woff2?|map|txt|webmanifest|xml|ico|svg|png|jpg|jpeg|gif|webp)$/.test(pathname)) {
    return true;
  }
  return false;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Next.js metadata routes + static public assets (must skip i18n)
  if (shouldSkipIntl(pathname)) {
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
    "/((?!_next/static|_next/image|favicon.ico|icon|apple-icon|opengraph-image|robots.txt|sitemap.xml|manifest.webmanifest|site.webmanifest|ads\\.txt|pdf\\.worker\\.min\\.mjs|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|mjs|wasm|txt|webmanifest|xml)$).*)",
  ],
};
