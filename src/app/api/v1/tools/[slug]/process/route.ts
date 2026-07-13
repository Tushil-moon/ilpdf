import { NextRequest } from "next/server";
import { getToolBySlug } from "@/lib/tools";
import { apiGuard } from "@/lib/api/guard";
import { apiError, API_ERROR_CODES } from "@/lib/api/response";
import { extractFilesFromFormData, parseJsonOptions } from "@/lib/api/schemas";
import {
  createProcessStream,
  processStreamResponse,
  runProcessPipeline,
} from "@/services/process-pipeline";
import type { ProcessOptions } from "@/types";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

/** POST /api/v1/tools/[slug]/process — Process files (NDJSON stream) */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const guard = await apiGuard(request);
  if (!guard.ok) return guard.response;

  const { requestId, auth } = guard.ctx;
  const { slug } = await params;

  if (!getToolBySlug(slug)) {
    return apiError(404, API_ERROR_CODES.TOOL_NOT_FOUND, `Tool '${slug}' not found`, undefined, requestId);
  }

  const stream = createProcessStream(async (send) => {
    send({
      type: "progress",
      progress: 3,
      stage: "preparing",
      message: "Preparing your files...",
    });

    const formData = await request.formData();
    const files = extractFilesFromFormData(formData);
    const optionsRaw = formData.get("options") as string | null;

    let options: ProcessOptions | undefined;
    try {
      options = parseJsonOptions(optionsRaw) as ProcessOptions | undefined;
    } catch {
      send({ type: "error", error: "Invalid options JSON" });
      return;
    }

    await runProcessPipeline({
      toolSlug: slug,
      files,
      options,
      userId: auth.userId,
      send,
    });
  });

  return processStreamResponse(stream, requestId);
}
