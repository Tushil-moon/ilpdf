import { NextRequest } from "next/server";
import { apiGuard, withApiHeaders } from "@/lib/api/guard";
import { apiSuccess } from "@/lib/api/response";

export const dynamic = "force-dynamic";

/** GET /api/v1/health */
export async function GET(request: NextRequest) {
  const guard = await apiGuard(request);
  if (!guard.ok) return guard.response;

  return withApiHeaders(
    apiSuccess({
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    }),
    guard.ctx.requestId
  );
}
