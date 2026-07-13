import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiGuard, withApiHeaders } from "@/lib/api/guard";
import { apiError, apiSuccess, API_ERROR_CODES } from "@/lib/api/response";
import { canAccessFile } from "@/lib/api/auth";

export const dynamic = "force-dynamic";

/** GET /api/v1/jobs/[jobId] — Job status */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const guard = await apiGuard(request);
  if (!guard.ok) return guard.response;

  const { jobId } = await params;
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    include: {
      file: {
        select: {
          id: true,
          userId: true,
          status: true,
          resultName: true,
          expiresAt: true,
        },
      },
    },
  });

  if (!job) {
    return withApiHeaders(
      apiError(404, API_ERROR_CODES.NOT_FOUND, "Job not found", undefined, guard.ctx.requestId),
      guard.ctx.requestId
    );
  }

  const allowed = await canAccessFile(guard.ctx.auth, job.file);
  if (!allowed) {
    return withApiHeaders(
      apiError(403, API_ERROR_CODES.FORBIDDEN, "Access denied", undefined, guard.ctx.requestId),
      guard.ctx.requestId
    );
  }

  return withApiHeaders(
    apiSuccess({
      id: job.id,
      toolSlug: job.toolSlug,
      status: job.status,
      progress: job.progress,
      error: job.error,
      fileId: job.fileId,
      file: {
        id: job.file.id,
        status: job.file.status,
        resultName: job.file.resultName,
        expiresAt: job.file.expiresAt,
      },
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
    }),
    guard.ctx.requestId
  );
}
