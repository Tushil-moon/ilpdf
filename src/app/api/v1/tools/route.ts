import { NextRequest } from "next/server";
import { PDF_TOOLS } from "@/lib/tools";
import { apiGuard, withApiHeaders } from "@/lib/api/guard";
import { apiSuccess } from "@/lib/api/response";

export const dynamic = "force-dynamic";

/** GET /api/v1/tools — List all PDF tools */
export async function GET(request: NextRequest) {
  const guard = await apiGuard(request);
  if (!guard.ok) return guard.response;

  const tools = PDF_TOOLS.map((tool) => ({
    slug: tool.slug,
    name: tool.name,
    description: tool.shortDescription,
    category: tool.category,
    multiFile: tool.multiFile,
    maxFiles: tool.maxFiles,
    acceptedTypes: tool.acceptedTypes,
    processEndpoint: `/api/v1/tools/${tool.slug}/process`,
  }));

  return withApiHeaders(apiSuccess({ tools, total: tools.length }), guard.ctx.requestId);
}
