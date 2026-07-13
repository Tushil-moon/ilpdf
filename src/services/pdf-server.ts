import "server-only";
import type { PdfProcessor } from "@/services/pdf-client";
import {
  mergePdfs,
  splitPdf,
  rotatePdf,
  deletePages,
  addPageNumbers,
  addWatermark,
  imagesToPdf,
  repairPdf,
  compressPdf,
  organizePdf,
} from "@/services/pdf-client";
import {
  pdfToJpg,
  pdfToWord,
  wordToPdf,
  excelToPdf,
  powerpointToPdf,
  htmlToPdf,
  unlockPdf,
  protectPdfServer,
  ocrPdf,
} from "@/services/server-processors";

const ALL_PROCESSORS: Record<string, PdfProcessor> = {
  "merge-pdf": (files, opts) => mergePdfs(files, opts),
  "split-pdf": (files, opts) => splitPdf(files[0], opts),
  "compress-pdf": (files, opts) => compressPdf(files[0], opts),
  "rotate-pdf": (files, opts) => rotatePdf(files[0], opts),
  "delete-pages": (files, opts) => deletePages(files[0], opts),
  "extract-pages": (files, opts) => splitPdf(files[0], opts),
  "page-numbers": (files, opts) => addPageNumbers(files[0], opts),
  "watermark-pdf": (files, opts) => addWatermark(files[0], opts),
  "protect-pdf": (files, opts) => protectPdfServer(files[0], opts),
  "organize-pdf": (files, opts) => organizePdf(files[0], opts),
  "repair-pdf": (files, opts) => repairPdf(files[0], opts),
  "jpg-to-pdf": (files, opts) => imagesToPdf(files, opts),
  "pdf-to-jpg": (files, opts) => pdfToJpg(files[0], opts),
  "pdf-to-word": (files) => pdfToWord(files[0]),
  "word-to-pdf": (files) => wordToPdf(files[0]),
  "excel-to-pdf": (files) => excelToPdf(files[0]),
  "powerpoint-to-pdf": (files) => powerpointToPdf(files[0]),
  "html-to-pdf": (files, opts) => htmlToPdf(files[0], opts),
  "unlock-pdf": (files, opts) => unlockPdf(files[0], opts),
  "ocr-pdf": (files) => ocrPdf(files[0]),
};

export function getServerProcessor(toolSlug: string): PdfProcessor | undefined {
  return ALL_PROCESSORS[toolSlug];
}

export function getAllServerToolSlugs(): string[] {
  return Object.keys(ALL_PROCESSORS);
}

export function isToolSupportedOnServer(toolSlug: string): boolean {
  return toolSlug in ALL_PROCESSORS;
}
