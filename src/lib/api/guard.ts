import type { NextRequest } from "next/server";
import { rateLimit } from "@/lib/security";
import { apiError, API_ERROR_CODES } from "@/lib/api/response";
import { getRequestId } from "@/lib/api/request-id";
import { resolveApiAuth, type ApiAuthContext } from "@/lib/api/auth";

export interface ApiGuardOptions {
  requireAuth?: boolean;
}

export interface ApiGuardResult {
  requestId: string;
  auth: ApiAuthContext;
}

export async function apiGuard(
  request: NextRequest,
  options: ApiGuardOptions = {}
): Promise<{ ok: true; ctx: ApiGuardResult } | { ok: false; response: Response }> {
  const requestId = getRequestId(request);

  const rateLimitResponse = rateLimit(request);
  if (rateLimitResponse) {
    rateLimitResponse.headers.set("X-Request-Id", requestId);
    return { ok: false, response: rateLimitResponse };
  }

  const auth = await resolveApiAuth(request);

  if (options.requireAuth && !auth.userId) {
    return {
      ok: false,
      response: apiError(
        401,
        API_ERROR_CODES.UNAUTHORIZED,
        "Authentication required. Use a session cookie or Bearer API key.",
        undefined,
        requestId
      ),
    };
  }

  return { ok: true, ctx: { requestId, auth } };
}

export function withApiHeaders(response: Response, requestId: string): Response {
  response.headers.set("X-Request-Id", requestId);
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Cache-Control", "no-store");
  return response;
}
