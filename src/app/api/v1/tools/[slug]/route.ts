import { NextRequest } from "next/server";
import { getToolBySlug } from "@/lib/tools";
import { apiGuard, withApiHeaders } from "@/lib/api/guard";
import { apiError, apiSuccess, API_ERROR_CODES } from "@/lib/api/response";

export const dynamic = "force-dynamic";

/** GET /api/v1/tools/[slug] — Tool metadata */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const guard = await apiGuard(request);
  if (!guard.ok) return guard.response;

  const { slug } = await params;
  const tool = getToolBySlug(slug);

  if (!tool) {
    return withApiHeaders(
      apiError(404, API_ERROR_CODES.TOOL_NOT_FOUND, `Tool '${slug}' not found`, undefined, guard.ctx.requestId),
      guard.ctx.requestId
    );
  }

  return withApiHeaders(
    apiSuccess({
      slug: tool.slug,
      name: tool.name,
      description: tool.description,
      category: tool.category,
      multiFile: tool.multiFile,
      maxFiles: tool.maxFiles,
      acceptedTypes: tool.acceptedTypes,
      keywords: tool.keywords,
      processEndpoint: `/api/v1/tools/${tool.slug}/process`,
      method: "POST",
      contentType: "multipart/form-data",
      fields: {
        files: "One or more files (field name: files)",
        options: "Optional JSON string with tool-specific options",
      },
    }),
    guard.ctx.requestId
  );
}
