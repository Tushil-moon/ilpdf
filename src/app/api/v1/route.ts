import { NextRequest } from "next/server";
import { apiGuard, withApiHeaders } from "@/lib/api/guard";
import { apiSuccess } from "@/lib/api/response";

export const dynamic = "force-dynamic";

/** GET /api/v1 — API info & documentation */
export async function GET(request: NextRequest) {
  const guard = await apiGuard(request);
  if (!guard.ok) return guard.response;

  const { requestId } = guard.ctx;

  return withApiHeaders(
    apiSuccess({
      name: "ILPDF API",
      version: "1.0.0",
      documentation: {
        tools: "GET /api/v1/tools",
        toolDetail: "GET /api/v1/tools/{slug}",
        process: "POST /api/v1/tools/{slug}/process (multipart/form-data, NDJSON stream)",
        jobStatus: "GET /api/v1/jobs/{jobId}",
        fileMeta: "GET /api/v1/files/{fileId}",
        download: "GET /api/v1/files/{fileId}/download?token={token}",
        apiKeys: "GET|POST /api/v1/api-keys (auth required)",
        health: "GET /api/v1/health",
      },
      authentication: {
        session: "Browser session cookie (Better Auth)",
        apiKey: "Authorization: Bearer ilp_live_...",
      },
      streaming: {
        format: "application/x-ndjson",
        events: ["progress", "complete", "error"],
      },
    }),
    requestId
  );
}
