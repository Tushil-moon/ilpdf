import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/security";
import { getCurrentUserId } from "@/lib/auth-server";
import { getToolBySlug } from "@/lib/tools";
import { prisma } from "@/lib/prisma";
import {
  storeFile,
  generateStorageKey,
  getDownloadUrl,
} from "@/services/storage";

export const maxDuration = 60;

/** Persist client-side tool results for logged-in users (dashboard history). */
export async function POST(request: NextRequest) {
  const rateLimitResponse = rateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const toolSlug = formData.get("toolSlug") as string;
    const originalName = (formData.get("originalName") as string) || "document.pdf";
    const resultFile = formData.get("file");

    if (!toolSlug || !(resultFile instanceof File)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const tool = getToolBySlug(toolSlug);
    if (!tool) {
      return NextResponse.json({ error: "Invalid tool" }, { status: 400 });
    }

    const buffer = Buffer.from(await resultFile.arrayBuffer());
    const mimeType = resultFile.type || "application/pdf";
    const resultName = resultFile.name || "result.pdf";
    const retentionHours = parseInt(process.env.FILE_RETENTION_HOURS ?? "24", 10);
    const expiresAt = new Date(Date.now() + retentionHours * 3600 * 1000);

    const fileRecord = await prisma.file.create({
      data: {
        userId,
        originalName,
        storageKey: "pending",
        mimeType,
        size: buffer.length,
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
        progress: 90,
        options: { source: "client" },
      },
    });

    const storageKey = generateStorageKey(userId, resultName);
    await storeFile(storageKey, buffer, mimeType);

    await prisma.file.update({
      where: { id: fileRecord.id },
      data: {
        storageKey,
        status: "COMPLETED",
        resultKey: storageKey,
        resultName,
        metadata: { mimeType, source: "client" },
      },
    });

    await prisma.job.update({
      where: { id: jobRecord.id },
      data: { status: "COMPLETED", progress: 100 },
    });

    await prisma.download.create({
      data: { userId, fileId: fileRecord.id },
    });

    const downloadUrl = await getDownloadUrl(storageKey, fileRecord.id);

    return NextResponse.json({
      success: true,
      downloadUrl,
      fileName: resultName,
      fileId: fileRecord.id,
      mimeType,
    });
  } catch (error) {
    console.error("Record error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to save result" },
      { status: 500 }
    );
  }
}
