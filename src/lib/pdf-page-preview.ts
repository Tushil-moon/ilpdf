"use client";

import { generateId } from "@/lib/utils";
import type { EditorPage } from "@/lib/tool-page-editor";
import { getBrowserPdfJs } from "@/lib/pdfjs-browser";

const THUMB_WIDTH = 160;

export async function loadPdfPageThumbnails(file: File): Promise<EditorPage[]> {
  const pdfjs = await getBrowserPdfJs();
  const data = new Uint8Array(await file.arrayBuffer());
  const pdf = await pdfjs.getDocument({ data, useSystemFonts: true }).promise;
  const pages: EditorPage[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 1 });
    const scale = THUMB_WIDTH / viewport.width;
    const scaledViewport = page.getViewport({ scale });

    const canvas = document.createElement("canvas");
    canvas.width = scaledViewport.width;
    canvas.height = scaledViewport.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) continue;

    await page.render({ canvasContext: ctx, viewport: scaledViewport, canvas }).promise;

    pages.push({
      id: generateId(),
      sourceIndex: i,
      thumbnail: canvas.toDataURL("image/jpeg", 0.85),
      rotation: 0,
      markedForDeletion: false,
      selected: true,
    });
  }

  return pages;
}

export async function loadImageThumbnail(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
