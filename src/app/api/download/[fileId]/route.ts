import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { readStoredFile } from "@/services/storage";

export const runtime = "nodejs";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  try {
    const { fileId } = await params;

    const file = await prisma.file.findUnique({
      where: { id: fileId },
    });

    if (!file || file.status !== "COMPLETED" || !file.resultKey) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    if (file.expiresAt && file.expiresAt < new Date()) {
      return NextResponse.json({ error: "File has expired" }, { status: 410 });
    }

    const buffer = await readStoredFile(file.resultKey);
    const mimeType =
      (file.metadata as { mimeType?: string } | null)?.mimeType ?? "application/pdf";
    const fileName = file.resultName ?? "download";

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": mimeType,
        "Content-Disposition": `attachment; filename="${encodeURIComponent(fileName)}"; filename*=UTF-8''${encodeURIComponent(fileName)}`,
        "Content-Length": String(buffer.length),
        "Cache-Control": "private, no-cache",
      },
    });
  } catch (error) {
    console.error("Download error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Download failed" },
      { status: 500 }
    );
  }
}
