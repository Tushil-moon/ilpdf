import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiGuard, withApiHeaders } from "@/lib/api/guard";
import { apiError, apiSuccess, API_ERROR_CODES } from "@/lib/api/response";
import { createApiKeyForUser } from "@/lib/api/api-keys";
import { createApiKeySchema } from "@/lib/api/schemas";

export const dynamic = "force-dynamic";

/** GET /api/v1/api-keys — List API keys */
export async function GET(request: NextRequest) {
  const guard = await apiGuard(request, { requireAuth: true });
  if (!guard.ok) return guard.response;

  const keys = await prisma.apiKey.findMany({
    where: { userId: guard.ctx.auth.userId! },
    select: {
      id: true,
      name: true,
      prefix: true,
      lastUsed: true,
      expiresAt: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return withApiHeaders(apiSuccess({ keys }), guard.ctx.requestId);
}

/** POST /api/v1/api-keys — Create API key */
export async function POST(request: NextRequest) {
  const guard = await apiGuard(request, { requireAuth: true });
  if (!guard.ok) return guard.response;

  try {
    const body = await request.json();
    const parsed = createApiKeySchema.parse(body);
    const result = await createApiKeyForUser(guard.ctx.auth.userId!, parsed.name);

    return withApiHeaders(
      apiSuccess({
        key: result.key,
        id: result.id,
        name: result.name,
        prefix: result.prefix,
        createdAt: result.createdAt,
        warning: "Store this key securely. It will not be shown again.",
      }),
      guard.ctx.requestId
    );
  } catch (error) {
    return withApiHeaders(
      apiError(
        400,
        API_ERROR_CODES.VALIDATION_ERROR,
        error instanceof Error ? error.message : "Invalid request",
        undefined,
        guard.ctx.requestId
      ),
      guard.ctx.requestId
    );
  }
}
