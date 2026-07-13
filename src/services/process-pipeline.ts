import "server-only";

import { validateFile, virusScanHook } from "@/lib/security";
import { getToolBySlug } from "@/lib/tools";
import { getServerProcessor } from "@/services/pdf-server";
import {
  storeFile,
  generateStorageKey,
  getDownloadUrl,
} from "@/services/storage";
import { prisma } from "@/lib/prisma";
import { appendDownloadToken } from "@/lib/api/download-token";
import { stripProgressCallback } from "@/lib/process-progress";
import type { ProcessStage, ProcessStreamEvent } from "@/lib/process-progress";
import type { ProcessOptions } from "@/types";

export type ProcessEventSender = (event: ProcessStreamEvent) => void;

export interface ProcessPipelineInput {
  toolSlug: string;
  files: File[];
  options?: ProcessOptions;
  userId: string | null;
  send: ProcessEventSender;
}

export interface ProcessPipelineResult {
  fileId: string;
  jobId: string;
  downloadUrl: string;
  fileName: string;
  mimeType?: string;
}

export async function runProcessPipeline(
  input: ProcessPipelineInput
): Promise<ProcessPipelineResult | null> {
  const { toolSlug, files, options, userId, send } = input;

  const fail = (message: string): null => {
    send({ type: "error", error: message });
    return null;
  };

  const tool = getToolBySlug(toolSlug);
  if (!tool) return fail("Invalid tool");

  if (files.length === 0) return fail("No files provided");

  if (files.length > tool.maxFiles) {
    return fail(`Maximum ${tool.maxFiles} files allowed for this tool`);
  }

  send({
    type: "progress",
    progress: 8,
    stage: "validating",
    message: "Validating files...",
  });

  for (const file of files) {
    const validation = validateFile(file, tool.acceptedTypes);
    if (!validation.valid) {
      return fail(validation.error ?? "Invalid file");
    }
  }

  const buffers: Uint8Array[] = [];
  for (let i = 0; i < files.length; i++) {
    send({
      type: "progress",
      progress: 12 + Math.round(((i + 1) / files.length) * 18),
      stage: "reading",
      message:
        files.length > 1
          ? `Reading file ${i + 1} of ${files.length}...`
          : "Reading your file...",
    });

    const buffer = Buffer.from(await files[i].arrayBuffer());
    const scan = await virusScanHook(buffer);
    if (!scan.clean) {
      return fail(scan.message ?? "File failed security scan");
    }
    buffers.push(new Uint8Array(buffer));
  }

  const processor = getServerProcessor(toolSlug);
  if (!processor) return fail("Tool not supported on server");

  const retentionHours = parseInt(process.env.FILE_RETENTION_HOURS ?? "24", 10);
  const expiresAt = new Date(Date.now() + retentionHours * 3600 * 1000);
  const cleanOptions = stripProgressCallback(options) as ProcessOptions | undefined;

  const fileRecord = await prisma.file.create({
    data: {
      userId,
      originalName: files[0].name,
      storageKey: "pending",
      mimeType: files[0].type || "application/octet-stream",
      size: files.reduce((sum, f) => sum + f.size, 0),
      toolSlug,
      status: "PROCESSING",
      expiresAt,
    },
  });

  const jobRecord = await prisma.job.create({
    data: {
      fileId: fileRecord.id,
      toolSlug,
      status: "ACTIVE",
      progress: 10,
      options: (cleanOptions ?? undefined) as object | undefined,
    },
  });

  send({
    type: "progress",
    progress: 35,
    stage: "processing",
    message: `Running ${tool.name}...`,
  });

  let lastReported = 35;

  const result = await processor(buffers, {
    ...cleanOptions,
    onProgress: (update: { progress: number; stage: string; message: string }) => {
      const mapped = 35 + Math.round(update.progress * 0.45);
      if (mapped > lastReported) {
        lastReported = mapped;
        send({
          type: "progress",
          progress: mapped,
          stage: update.stage as ProcessStage,
          message: update.message,
        });
        void prisma.job.update({
          where: { id: jobRecord.id },
          data: { progress: mapped },
        });
      }
    },
  });

  if (!result.success || !result.data) {
    await prisma.job.update({
      where: { id: jobRecord.id },
      data: { status: "FAILED", error: result.error ?? "Processing failed", progress: 0 },
    });
    await prisma.file.update({
      where: { id: fileRecord.id },
      data: { status: "FAILED" },
    });
    const message = result.error ?? "Processing failed";
    send({ type: "error", error: message });
    return null;
  }

  send({
    type: "progress",
    progress: 82,
    stage: "saving",
    message: "Saving your result...",
  });

  const storageKey = generateStorageKey(userId, result.fileName ?? "result.pdf");
  await storeFile(storageKey, Buffer.from(result.data), result.mimeType ?? "application/pdf");

  await prisma.file.update({
    where: { id: fileRecord.id },
    data: {
      storageKey,
      status: "COMPLETED",
      resultKey: storageKey,
      resultName: result.fileName,
      metadata: { mimeType: result.mimeType },
    },
  });

  await prisma.job.update({
    where: { id: jobRecord.id },
    data: { status: "COMPLETED", progress: 100 },
  });

  if (userId) {
    await prisma.download.create({
      data: { userId, fileId: fileRecord.id },
    });
  }

  send({
    type: "progress",
    progress: 94,
    stage: "finalizing",
    message: "Preparing download...",
  });

  const baseDownloadUrl = await getDownloadUrl(storageKey, fileRecord.id);
  const downloadUrl = appendDownloadToken(baseDownloadUrl, fileRecord.id);
  const fileName = result.fileName ?? "result.pdf";

  send({
    type: "complete",
    downloadUrl,
    fileName,
    fileId: fileRecord.id,
    jobId: jobRecord.id,
    mimeType: result.mimeType,
  });

  return {
    fileId: fileRecord.id,
    jobId: jobRecord.id,
    downloadUrl,
    fileName,
    mimeType: result.mimeType,
  };
}

export function createProcessStream(
  handler: (send: ProcessEventSender) => Promise<void>
): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      const send: ProcessEventSender = (event) => {
        controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
      };

      try {
        await handler(send);
      } catch (error) {
        console.error("Process stream error:", error);
        send({
          type: "error",
          error: error instanceof Error ? error.message : "Internal server error",
        });
      } finally {
        controller.close();
      }
    },
  });
}

export function processStreamResponse(stream: ReadableStream<Uint8Array>, requestId: string): Response {
  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Request-Id": requestId,
    },
  });
}
