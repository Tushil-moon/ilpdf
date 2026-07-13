import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { readStoredFile } from "@/services/storage";
import { apiGuard } from "@/lib/api/guard";
import { apiError, API_ERROR_CODES } from "@/lib/api/response";
import { canAccessFile } from "@/lib/api/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/v1/files/[fileId]/download — Secure file download */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  const guard = await apiGuard(request);
  if (!guard.ok) return guard.response;

  const { fileId } = await params;
  const token = request.nextUrl.searchParams.get("token");

  const file = await prisma.file.findUnique({ where: { id: fileId } });

  if (!file || file.status !== "COMPLETED" || !file.resultKey) {
    return apiError(404, API_ERROR_CODES.FILE_NOT_FOUND, "File not found", undefined, guard.ctx.requestId);
  }

  if (file.expiresAt && file.expiresAt < new Date()) {
    return apiError(410, API_ERROR_CODES.FILE_EXPIRED, "File has expired", undefined, guard.ctx.requestId);
  }

  const allowed = await canAccessFile(guard.ctx.auth, file, token);
  if (!allowed) {
    return apiError(403, API_ERROR_CODES.FORBIDDEN, "Access denied", undefined, guard.ctx.requestId);
  }

  try {
    const buffer = await readStoredFile(file.resultKey);
    const mimeType =
      (file.metadata as { mimeType?: string } | null)?.mimeType ?? file.mimeType ?? "application/pdf";
    const fileName = file.resultName ?? "download";

    const response = new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": mimeType,
        "Content-Disposition": `attachment; filename="${encodeURIComponent(fileName)}"; filename*=UTF-8''${encodeURIComponent(fileName)}`,
        "Content-Length": String(buffer.length),
        "Cache-Control": "private, no-cache",
        "X-Request-Id": guard.ctx.requestId,
      },
    });

    return response;
  } catch (error) {
    console.error("Download error:", error);
    return apiError(
      500,
      API_ERROR_CODES.INTERNAL_ERROR,
      error instanceof Error ? error.message : "Download failed",
      undefined,
      guard.ctx.requestId
    );
  }
}
