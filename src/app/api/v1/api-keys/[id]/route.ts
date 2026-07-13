import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiGuard, withApiHeaders } from "@/lib/api/guard";
import { apiError, apiSuccess, API_ERROR_CODES } from "@/lib/api/response";

export const dynamic = "force-dynamic";

/** DELETE /api/v1/api-keys/[id] — Revoke API key */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await apiGuard(request, { requireAuth: true });
  if (!guard.ok) return guard.response;

  const { id } = await params;

  const key = await prisma.apiKey.findFirst({
    where: { id, userId: guard.ctx.auth.userId! },
  });

  if (!key) {
    return withApiHeaders(
      apiError(404, API_ERROR_CODES.NOT_FOUND, "API key not found", undefined, guard.ctx.requestId),
      guard.ctx.requestId
    );
  }

  await prisma.apiKey.delete({ where: { id } });

  return withApiHeaders(apiSuccess({ revoked: true, id }), guard.ctx.requestId);
}
