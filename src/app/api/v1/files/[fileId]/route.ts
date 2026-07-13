import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiGuard, withApiHeaders } from "@/lib/api/guard";
import { apiError, apiSuccess, API_ERROR_CODES } from "@/lib/api/response";
import { canAccessFile } from "@/lib/api/auth";
import { appendDownloadToken } from "@/lib/api/download-token";
import { getDownloadUrl } from "@/services/storage";

export const dynamic = "force-dynamic";

/** GET /api/v1/files/[fileId] — File metadata */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  const guard = await apiGuard(request);
  if (!guard.ok) return guard.response;

  const { fileId } = await params;
  const file = await prisma.file.findUnique({ where: { id: fileId } });

  if (!file) {
    return withApiHeaders(
      apiError(404, API_ERROR_CODES.FILE_NOT_FOUND, "File not found", undefined, guard.ctx.requestId),
      guard.ctx.requestId
    );
  }

  const allowed = await canAccessFile(
    guard.ctx.auth,
    file,
    request.nextUrl.searchParams.get("token")
  );
  if (!allowed) {
    return withApiHeaders(
      apiError(403, API_ERROR_CODES.FORBIDDEN, "Access denied", undefined, guard.ctx.requestId),
      guard.ctx.requestId
    );
  }

  if (file.expiresAt && file.expiresAt < new Date()) {
    return withApiHeaders(
      apiError(410, API_ERROR_CODES.FILE_EXPIRED, "File has expired", undefined, guard.ctx.requestId),
      guard.ctx.requestId
    );
  }

  let downloadUrl: string | null = null;
  if (file.status === "COMPLETED" && file.resultKey) {
    const base = await getDownloadUrl(file.resultKey, file.id);
    downloadUrl = appendDownloadToken(base, file.id);
  }

  return withApiHeaders(
    apiSuccess({
      id: file.id,
      originalName: file.originalName,
      resultName: file.resultName,
      toolSlug: file.toolSlug,
      status: file.status,
      size: file.size,
      mimeType: file.mimeType,
      expiresAt: file.expiresAt,
      downloadUrl,
      createdAt: file.createdAt,
    }),
    guard.ctx.requestId
  );
}
