import { PDFDocument, degrees, rgb, StandardFonts } from "pdf-lib";
import type { JobResult, ProcessOptions } from "@/types";
import { encryptPdfFile } from "@/lib/pdf-crypto";

export type PdfProcessor = (
  files: Uint8Array[],
  options?: ProcessOptions
) => Promise<JobResult>;

/** Tools that must run on the server */
export const SERVER_ONLY_TOOLS = new Set([
  "pdf-to-word",
  "word-to-pdf",
  "excel-to-pdf",
  "powerpoint-to-pdf",
  "pdf-to-jpg",
  "unlock-pdf",
  "ocr-pdf",
  "html-to-pdf",
]);

export function isServerOnlyTool(toolSlug: string): boolean {
  return SERVER_ONLY_TOOLS.has(toolSlug);
}

export async function mergePdfs(files: Uint8Array[]): Promise<JobResult> {
  const merged = await PDFDocument.create();
  for (const file of files) {
    const pdf = await PDFDocument.load(file, { ignoreEncryption: true });
    const pages = await merged.copyPages(pdf, pdf.getPageIndices());
    pages.forEach((page) => merged.addPage(page));
  }
  const data = await merged.save();
  return { success: true, data, fileName: "merged.pdf", mimeType: "application/pdf" };
}

export async function splitPdf(
  file: Uint8Array,
  options?: ProcessOptions
): Promise<JobResult> {
  const pdf = await PDFDocument.load(file, { ignoreEncryption: true });
  const ranges = parsePageRanges((options?.pageRanges as string) ?? "1", pdf.getPageCount());
  const newPdf = await PDFDocument.create();
  const pages = await newPdf.copyPages(pdf, ranges.map((p) => p - 1));
  pages.forEach((page) => newPdf.addPage(page));
  const data = await newPdf.save();
  return { success: true, data, fileName: "extracted.pdf", mimeType: "application/pdf" };
}

export async function rotatePdf(file: Uint8Array, options?: ProcessOptions): Promise<JobResult> {
  const pdf = await PDFDocument.load(file, { ignoreEncryption: true });
  const pageRotations = options?.pageRotations as Record<number, number> | undefined;

  if (pageRotations && Object.keys(pageRotations).length > 0) {
    pdf.getPages().forEach((page, index) => {
      const angle = pageRotations[index + 1] ?? 0;
      if (angle) page.setRotation(degrees(angle));
    });
  } else {
    const angle = (options?.angle as number) ?? 90;
    pdf.getPages().forEach((page) => page.setRotation(degrees(angle)));
  }

  const data = await pdf.save();
  return { success: true, data, fileName: "rotated.pdf", mimeType: "application/pdf" };
}

export async function deletePages(file: Uint8Array, options?: ProcessOptions): Promise<JobResult> {
  const pdf = await PDFDocument.load(file, { ignoreEncryption: true });
  const pagesToDelete = new Set(parsePageRanges((options?.pages as string) ?? "", pdf.getPageCount()));
  const newPdf = await PDFDocument.create();
  const pages = await newPdf.copyPages(
    pdf,
    pdf.getPageIndices().filter((i) => !pagesToDelete.has(i + 1))
  );
  pages.forEach((page) => newPdf.addPage(page));
  const data = await newPdf.save();
  return { success: true, data, fileName: "edited.pdf", mimeType: "application/pdf" };
}

export async function addPageNumbers(file: Uint8Array, options?: ProcessOptions): Promise<JobResult> {
  const pdf = await PDFDocument.load(file, { ignoreEncryption: true });
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const position = (options?.position as string) ?? "bottom-center";
  pdf.getPages().forEach((page, index) => {
    const { width, height } = page.getSize();
    const text = `${index + 1}`;
    const textWidth = font.widthOfTextAtSize(text, 12);
    let x = width / 2 - textWidth / 2;
    let y = 30;
    if (position.includes("top")) y = height - 30;
    if (position.includes("left")) x = 30;
    if (position.includes("right")) x = width - textWidth - 30;
    page.drawText(text, { x, y, size: 12, font, color: rgb(0.3, 0.3, 0.3) });
  });
  const data = await pdf.save();
  return { success: true, data, fileName: "numbered.pdf", mimeType: "application/pdf" };
}

export async function addWatermark(file: Uint8Array, options?: ProcessOptions): Promise<JobResult> {
  const pdf = await PDFDocument.load(file, { ignoreEncryption: true });
  const font = await pdf.embedFont(StandardFonts.HelveticaBold);
  const text = (options?.text as string) ?? "CONFIDENTIAL";
  pdf.getPages().forEach((page) => {
    const { width, height } = page.getSize();
    const textWidth = font.widthOfTextAtSize(text, 48);
    page.drawText(text, {
      x: width / 2 - textWidth / 2,
      y: height / 2,
      size: 48,
      font,
      color: rgb(0.8, 0.8, 0.8),
      opacity: 0.3,
      rotate: degrees(45),
    });
  });
  const data = await pdf.save();
  return { success: true, data, fileName: "watermarked.pdf", mimeType: "application/pdf" };
}

export async function imagesToPdf(files: Uint8Array[]): Promise<JobResult> {
  const pdf = await PDFDocument.create();
  for (const file of files) {
    let image;
    try {
      image = await pdf.embedJpg(file);
    } catch {
      image = await pdf.embedPng(file);
    }
    const { width, height } = image.scale(1);
    const page = pdf.addPage([width, height]);
    page.drawImage(image, { x: 0, y: 0, width, height });
  }
  const data = await pdf.save();
  return { success: true, data, fileName: "images.pdf", mimeType: "application/pdf" };
}

export async function repairPdf(file: Uint8Array): Promise<JobResult> {
  const pdf = await PDFDocument.load(file, { ignoreEncryption: true });
  const data = await pdf.save({ useObjectStreams: false });
  return { success: true, data, fileName: "repaired.pdf", mimeType: "application/pdf" };
}

export async function compressPdf(file: Uint8Array): Promise<JobResult> {
  const pdf = await PDFDocument.load(file, { ignoreEncryption: true });
  const data = await pdf.save({ useObjectStreams: true });
  return { success: true, data, fileName: "compressed.pdf", mimeType: "application/pdf" };
}

export async function organizePdf(file: Uint8Array, options?: ProcessOptions): Promise<JobResult> {
  const pdf = await PDFDocument.load(file, { ignoreEncryption: true });
  const order = (options?.pageOrder as number[]) ?? pdf.getPageIndices().map((i) => i + 1);
  const newPdf = await PDFDocument.create();
  const pages = await newPdf.copyPages(pdf, order.map((p) => p - 1));
  pages.forEach((page) => newPdf.addPage(page));
  const data = await newPdf.save();
  return { success: true, data, fileName: "organized.pdf", mimeType: "application/pdf" };
}

const CLIENT_PROCESSORS: Record<string, PdfProcessor> = {
  "merge-pdf": (files) => mergePdfs(files),
  "split-pdf": (files, opts) => splitPdf(files[0], opts),
  "compress-pdf": (files) => compressPdf(files[0]),
  "rotate-pdf": (files, opts) => rotatePdf(files[0], opts),
  "delete-pages": (files, opts) => deletePages(files[0], opts),
  "extract-pages": (files, opts) => splitPdf(files[0], opts),
  "page-numbers": (files, opts) => addPageNumbers(files[0], opts),
  "watermark-pdf": (files, opts) => addWatermark(files[0], opts),
  "protect-pdf": (files, opts) => encryptPdfFile(files[0], opts),
  "organize-pdf": (files, opts) => organizePdf(files[0], opts),
  "repair-pdf": (files) => repairPdf(files[0]),
  "jpg-to-pdf": (files) => imagesToPdf(files),
};

export function getClientProcessor(toolSlug: string): PdfProcessor | undefined {
  if (isServerOnlyTool(toolSlug)) return undefined;
  return CLIENT_PROCESSORS[toolSlug];
}

function parsePageRanges(input: string, maxPages: number): number[] {
  if (!input.trim()) return Array.from({ length: maxPages }, (_, i) => i + 1);
  const pages: number[] = [];
  for (const part of input.split(",")) {
    const trimmed = part.trim();
    if (trimmed.includes("-")) {
      const [start, end] = trimmed.split("-").map(Number);
      for (let i = start; i <= (end || start); i++) {
        if (i >= 1 && i <= maxPages) pages.push(i);
      }
    } else {
      const num = Number(trimmed);
      if (num >= 1 && num <= maxPages) pages.push(num);
    }
  }
  return [...new Set(pages)].sort((a, b) => a - b);
}
