import { NextRequest, NextResponse } from "next/server";
import { rateLimit, validateFile, virusScanHook } from "@/lib/security";
import { getServerProcessor } from "@/services/pdf-server";
import {
  storeFile,
  generateStorageKey,
  getDownloadUrl,
} from "@/services/storage";
import { getToolBySlug } from "@/lib/tools";
import { getCurrentUserId } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const rateLimitResponse = rateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const formData = await request.formData();
    const toolSlug = formData.get("toolSlug") as string;
    const optionsRaw = formData.get("options") as string | null;
    const options = optionsRaw ? JSON.parse(optionsRaw) : undefined;

    const tool = getToolBySlug(toolSlug);
    if (!tool) {
      return NextResponse.json({ error: "Invalid tool" }, { status: 400 });
    }

    const files: File[] = [];
    formData.forEach((value, key) => {
      if (key === "files" && value instanceof File) files.push(value);
    });

    if (files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    for (const file of files) {
      const validation = validateFile(file, tool.acceptedTypes);
      if (!validation.valid) {
        return NextResponse.json({ error: validation.error }, { status: 400 });
      }
    }

    const buffers: Uint8Array[] = [];
    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const scan = await virusScanHook(buffer);
      if (!scan.clean) {
        return NextResponse.json(
          { error: scan.message ?? "File failed security scan" },
          { status: 400 }
        );
      }
      buffers.push(new Uint8Array(buffer));
    }

    const processor = getServerProcessor(toolSlug);
    if (!processor) {
      return NextResponse.json({ error: "Tool not supported" }, { status: 501 });
    }

    const userId = await getCurrentUserId();
    const retentionHours = parseInt(process.env.FILE_RETENTION_HOURS ?? "24", 10);
    const expiresAt = new Date(Date.now() + retentionHours * 3600 * 1000);

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
        options: options ?? undefined,
      },
    });

    const result = await processor(buffers, options);

    if (!result.success || !result.data) {
      await prisma.job.update({
        where: { id: jobRecord.id },
        data: { status: "FAILED", error: result.error ?? "Processing failed", progress: 0 },
      });
      await prisma.file.update({
        where: { id: fileRecord.id },
        data: { status: "FAILED" },
      });
      return NextResponse.json(
        { error: result.error ?? "Processing failed" },
        { status: 500 }
      );
    }

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

    const downloadUrl = await getDownloadUrl(storageKey, fileRecord.id);

    return NextResponse.json({
      success: true,
      downloadUrl,
      fileName: result.fileName,
      fileId: fileRecord.id,
      mimeType: result.mimeType,
    });
  } catch (error) {
    console.error("Process error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
