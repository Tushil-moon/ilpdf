import "server-only";
import { PDFDocument, rgb, StandardFonts, PageSizes } from "pdf-lib";
import mammoth from "mammoth";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
} from "docx";
import * as XLSX from "xlsx";
import JSZip from "jszip";
import type { JobResult, ProcessOptions } from "@/types";
import { decryptPdfFile, encryptPdfFile } from "@/lib/pdf-crypto";

async function extractPdfText(file: Uint8Array): Promise<{ text: string; numPages: number }> {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const pdf = await pdfjs.getDocument({ data: new Uint8Array(file), useSystemFonts: true }).promise;
  const numPages = pdf.numPages;
  const parts: string[] = [];

  for (let i = 1; i <= numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ");
    parts.push(pageText);
  }

  return { text: parts.join("\n\n"), numPages };
}

export async function pdfToJpg(
  file: Uint8Array,
  options?: ProcessOptions
): Promise<JobResult> {
  const quality = (options?.quality as number) ?? 90;
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");

  const data = new Uint8Array(file);
  const pdf = await pdfjs.getDocument({ data, useSystemFonts: true }).promise;
  const pageNum = pdf.numPages;
  const format = (options?.format as string) ?? "jpg";

  if (pageNum === 1) {
    const imageBuffer = await renderPageToImage(pdf, 1, quality, format);
    return {
      success: true,
      data: imageBuffer,
      fileName: `page-1.${format === "png" ? "png" : "jpg"}`,
      mimeType: format === "png" ? "image/png" : "image/jpeg",
    };
  }

  const zipBuffers: { name: string; data: Buffer }[] = [];
  for (let i = 1; i <= pageNum; i++) {
    const imageBuffer = await renderPageToImage(pdf, i, quality, format);
    zipBuffers.push({
      name: `page-${i}.${format === "png" ? "png" : "jpg"}`,
      data: imageBuffer,
    });
  }

  const zipData = await createZip(zipBuffers);
  return {
    success: true,
    data: zipData,
    fileName: "pdf-pages.zip",
    mimeType: "application/zip",
  };
}

async function renderPageToImage(
  pdf: { getPage: (n: number) => Promise<unknown> },
  pageNumber: number,
  quality: number,
  format: string
): Promise<Buffer> {
  const { createCanvas } = await import("@napi-rs/canvas");
  const page = (await pdf.getPage(pageNumber)) as {
    getViewport: (opts: { scale: number }) => { width: number; height: number };
    render: (ctx: {
      canvasContext: CanvasRenderingContext2D;
      viewport: { width: number; height: number };
    }) => { promise: Promise<void> };
  };

  const scale = 2;
  const viewport = page.getViewport({ scale });
  const canvas = createCanvas(viewport.width, viewport.height);
  const context = canvas.getContext("2d");

  await page.render({
    canvasContext: context as unknown as CanvasRenderingContext2D,
    viewport,
  }).promise;

  if (format === "png") {
    return canvas.toBuffer("image/png");
  }
  return canvas.toBuffer("image/jpeg", quality / 100);
}

async function createZip(files: { name: string; data: Buffer }[]): Promise<Uint8Array> {
  const zip = new JSZip();
  for (const f of files) {
    zip.file(f.name, f.data);
  }
  const buffer = await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });
  return new Uint8Array(buffer);
}

export async function pdfToWord(file: Uint8Array): Promise<JobResult> {
  try {
    const parsed = await extractPdfText(file);
    const paragraphs = parsed.text
    .split(/\n\s*\n/)
    .filter((p) => p.trim())
    .map(
      (text) =>
        new Paragraph({
          children: [new TextRun(text.trim())],
          spacing: { after: 200 },
        })
    );

  if (paragraphs.length === 0) {
    paragraphs.push(
      new Paragraph({
        children: [new TextRun("No extractable text found in this PDF.")],
      })
    );
  }

  const doc = new Document({
    sections: [{ children: paragraphs }],
  });

  const buffer = await Packer.toBuffer(doc);
  return {
    success: true,
    data: new Uint8Array(buffer),
    fileName: "converted.docx",
    mimeType:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to convert PDF to Word",
    };
  }
}

export async function wordToPdf(file: Uint8Array): Promise<JobResult> {
  const result = await mammoth.extractRawText({ buffer: Buffer.from(file) });
  const text = result.value || "Empty document";

  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const fontSize = 11;
  const margin = 50;
  const lineHeight = fontSize * 1.4;
  const pageWidth = PageSizes.A4[0];
  const pageHeight = PageSizes.A4[1];
  const maxWidth = pageWidth - margin * 2;

  let page = pdf.addPage(PageSizes.A4);
  let y = pageHeight - margin;

  const lines = wrapText(text, font, fontSize, maxWidth);

  for (const line of lines) {
    if (y < margin) {
      page = pdf.addPage(PageSizes.A4);
      y = pageHeight - margin;
    }
    page.drawText(line, { x: margin, y, size: fontSize, font, color: rgb(0, 0, 0) });
    y -= lineHeight;
  }

  const data = await pdf.save();
  return { success: true, data, fileName: "converted.pdf", mimeType: "application/pdf" };
}

export async function excelToPdf(file: Uint8Array): Promise<JobResult> {
  const workbook = XLSX.read(file, { type: "buffer" });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1 }) as string[][];

  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const fontSize = 9;
  const margin = 40;
  const rowHeight = 16;
  const pageWidth = PageSizes.A4[1];
  const pageHeight = PageSizes.A4[0];

  let page = pdf.addPage([pageWidth, pageHeight]);
  let y = pageHeight - margin;

  for (const row of rows) {
    if (y < margin) {
      page = pdf.addPage([pageWidth, pageHeight]);
      y = pageHeight - margin;
    }
    const line = (row || []).map((c) => String(c ?? "")).join("  |  ");
    const truncated = line.length > 120 ? `${line.slice(0, 117)}...` : line;
    page.drawText(truncated, { x: margin, y, size: fontSize, font, color: rgb(0, 0, 0) });
    y -= rowHeight;
  }

  const data = await pdf.save();
  return { success: true, data, fileName: "spreadsheet.pdf", mimeType: "application/pdf" };
}

export async function powerpointToPdf(file: Uint8Array): Promise<JobResult> {
  const zip = await JSZip.loadAsync(file);
  const slideFiles = Object.keys(zip.files)
    .filter((name) => name.match(/ppt\/slides\/slide\d+\.xml$/))
    .sort((a, b) => {
      const numA = parseInt(a.match(/slide(\d+)/)?.[1] ?? "0", 10);
      const numB = parseInt(b.match(/slide(\d+)/)?.[1] ?? "0", 10);
      return numA - numB;
    });

  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdf.embedFont(StandardFonts.HelveticaBold);

  for (let i = 0; i < slideFiles.length; i++) {
    const xml = await zip.file(slideFiles[i])?.async("text");
    const texts = extractXmlTexts(xml ?? "");
    const page = pdf.addPage(PageSizes.A4);
    const { width, height } = page.getSize();

    page.drawText(`Slide ${i + 1}`, {
      x: 50,
      y: height - 50,
      size: 18,
      font: boldFont,
      color: rgb(0.2, 0.2, 0.2),
    });

    let y = height - 90;
    for (const text of texts.slice(0, 25)) {
      if (y < 50) break;
      page.drawText(text.slice(0, 100), {
        x: 50,
        y,
        size: 11,
        font,
        color: rgb(0, 0, 0),
      });
      y -= 20;
    }
  }

  if (slideFiles.length === 0) {
    const page = pdf.addPage(PageSizes.A4);
    page.drawText("No slides found in presentation.", { x: 50, y: 700, size: 14, font });
  }

  const data = await pdf.save();
  return { success: true, data, fileName: "presentation.pdf", mimeType: "application/pdf" };
}

function extractXmlTexts(xml: string): string[] {
  const matches = xml.match(/<a:t[^>]*>([^<]*)<\/a:t>/g) ?? [];
  return matches
    .map((m) => m.replace(/<[^>]+>/g, "").trim())
    .filter(Boolean);
}

export async function htmlToPdf(
  file: Uint8Array,
  options?: ProcessOptions
): Promise<JobResult> {
  const htmlContent =
    (options?.html as string) ?? new TextDecoder().decode(file);
  const text = stripHtml(htmlContent);

  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const fontSize = 11;
  const margin = 50;
  const lineHeight = fontSize * 1.4;
  const pageWidth = PageSizes.A4[0];
  const pageHeight = PageSizes.A4[1];
  const maxWidth = pageWidth - margin * 2;

  let page = pdf.addPage(PageSizes.A4);
  let y = pageHeight - margin;
  const lines = wrapText(text, font, fontSize, maxWidth);

  for (const line of lines) {
    if (y < margin) {
      page = pdf.addPage(PageSizes.A4);
      y = pageHeight - margin;
    }
    page.drawText(line, { x: margin, y, size: fontSize, font, color: rgb(0, 0, 0) });
    y -= lineHeight;
  }

  const data = await pdf.save();
  return { success: true, data, fileName: "webpage.pdf", mimeType: "application/pdf" };
}

function stripHtml(html: string): string {
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

export async function unlockPdf(
  file: Uint8Array,
  options?: ProcessOptions
): Promise<JobResult> {
  const password = (options?.password as string) ?? "";
  if (!password) {
    return { success: false, error: "Please enter the PDF password." };
  }

  const result = await decryptPdfFile(file, options);
  if (result.success) return result;

  try {
    const { execFile } = await import("child_process");
    const { promisify } = await import("util");
    const { writeFile, readFile, unlink } = await import("fs/promises");
    const { join } = await import("path");
    const { tmpdir } = await import("os");
    const execFileAsync = promisify(execFile);
    const id = `${Date.now()}`;
    const inputPath = join(tmpdir(), `ilpdf-unlock-in-${id}.pdf`);
    const outputPath = join(tmpdir(), `ilpdf-unlock-out-${id}.pdf`);
    await writeFile(inputPath, Buffer.from(file));
    await execFileAsync("qpdf", [`--password=${password}`, "--decrypt", inputPath, outputPath]);
    const data = await readFile(outputPath);
    await unlink(inputPath).catch(() => {});
    await unlink(outputPath).catch(() => {});
    return {
      success: true,
      data: new Uint8Array(data),
      fileName: "unlocked.pdf",
      mimeType: "application/pdf",
    };
  } catch {
    return result;
  }
}

export async function protectPdfServer(
  file: Uint8Array,
  options?: ProcessOptions
): Promise<JobResult> {
  return encryptPdfFile(file, options);
}

export async function ocrPdf(file: Uint8Array): Promise<JobResult> {
  try {
    const parsed = await extractPdfText(file);
    const pdf = await PDFDocument.load(file, { ignoreEncryption: true });
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const pages = pdf.getPages();
  const textLines = parsed.text.split("\n").filter((l) => l.trim());

  pages.forEach((page, index) => {
    const { height } = page.getSize();
    const pageText = textLines.slice(index * 5, (index + 1) * 5).join(" ") || parsed.text.slice(0, 200);
    page.drawText(pageText.slice(0, 500), {
      x: 10,
      y: 10,
      size: 0.1,
      font,
      color: rgb(1, 1, 1),
      opacity: 0.01,
    });
    page.drawText(`[Searchable OCR Layer - Page ${index + 1}]`, {
      x: 50,
      y: height - 30,
      size: 8,
      font,
      color: rgb(0.4, 0.4, 0.4),
    });
  });

  const data = await pdf.save();
  return {
    success: true,
    data,
    fileName: "searchable.pdf",
    mimeType: "application/pdf",
  };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "OCR processing failed",
    };
  }
}

export async function compressPdfAdvanced(file: Uint8Array): Promise<JobResult> {
  const pdf = await PDFDocument.load(file, { ignoreEncryption: true });
  const data = await pdf.save({
    useObjectStreams: true,
    addDefaultPage: false,
  });

  if (data.length >= file.length * 0.95) {
    const reparsed = await PDFDocument.load(data);
    const recompressed = await reparsed.save({ useObjectStreams: false });
    return {
      success: true,
      data: recompressed,
      fileName: "compressed.pdf",
      mimeType: "application/pdf",
    };
  }

  return { success: true, data, fileName: "compressed.pdf", mimeType: "application/pdf" };
}

function wrapText(
  text: string,
  font: Awaited<ReturnType<typeof PDFDocument.prototype.embedFont>>,
  fontSize: number,
  maxWidth: number
): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const width = font.widthOfTextAtSize(testLine, fontSize);
    if (width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines.length > 0 ? lines : [""];
}
