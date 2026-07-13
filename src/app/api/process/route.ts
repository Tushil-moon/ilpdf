import { NextRequest } from "next/server";
import { apiGuard } from "@/lib/api/guard";
import { extractFilesFromFormData, parseJsonOptions } from "@/lib/api/schemas";
import {
  createProcessStream,
  processStreamResponse,
  runProcessPipeline,
} from "@/services/process-pipeline";
import type { ProcessOptions } from "@/types";

export const maxDuration = 60;

/** Legacy endpoint — delegates to shared process pipeline. Prefer /api/v1/tools/{slug}/process */
export async function POST(request: NextRequest) {
  const guard = await apiGuard(request);
  if (!guard.ok) return guard.response;

  const { requestId, auth } = guard.ctx;

  const stream = createProcessStream(async (send) => {
    send({
      type: "progress",
      progress: 3,
      stage: "preparing",
      message: "Preparing your files...",
    });

    const formData = await request.formData();
    const toolSlug = formData.get("toolSlug") as string;
    const optionsRaw = formData.get("options") as string | null;

    if (!toolSlug) {
      send({ type: "error", error: "toolSlug is required" });
      return;
    }

    let options: ProcessOptions | undefined;
    try {
      options = parseJsonOptions(optionsRaw) as ProcessOptions | undefined;
    } catch {
      send({ type: "error", error: "Invalid options JSON" });
      return;
    }

    await runProcessPipeline({
      toolSlug,
      files: extractFilesFromFormData(formData),
      options,
      userId: auth.userId,
      send,
    });
  });

  return processStreamResponse(stream, requestId);
}
