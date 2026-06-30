import { describe, it, expect } from "vitest";
import { mergePdfs, splitPdf, rotatePdf } from "@/services/pdf-client";
import { PDFDocument } from "pdf-lib";

async function createTestPdf(pageCount = 1): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  for (let i = 0; i < pageCount; i++) {
    pdf.addPage([612, 792]);
  }
  return pdf.save();
}

describe("PDF Processor", () => {
  it("should merge multiple PDFs", async () => {
    const pdf1 = await createTestPdf(1);
    const pdf2 = await createTestPdf(2);
    const result = await mergePdfs([pdf1, pdf2]);

    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();

    const merged = await PDFDocument.load(result.data!);
    expect(merged.getPageCount()).toBe(3);
  });

  it("should split PDF by page range", async () => {
    const pdf = await createTestPdf(5);
    const result = await splitPdf(pdf, { pageRanges: "1-2" });

    expect(result.success).toBe(true);
    const split = await PDFDocument.load(result.data!);
    expect(split.getPageCount()).toBe(2);
  });

  it("should rotate PDF pages", async () => {
    const pdf = await createTestPdf(1);
    const result = await rotatePdf(pdf, { angle: 90 });

    expect(result.success).toBe(true);
    expect(result.fileName).toBe("rotated.pdf");
  });
});

describe("Utils", () => {
  it("should format file sizes", async () => {
    const { formatFileSize } = await import("@/lib/utils");
    expect(formatFileSize(0)).toBe("0 B");
    expect(formatFileSize(1024)).toBe("1 KB");
    expect(formatFileSize(1048576)).toBe("1 MB");
  });

  it("should slugify text", async () => {
    const { slugify } = await import("@/lib/utils");
    expect(slugify("Hello World!")).toBe("hello-world");
    expect(slugify("Merge PDF Tool")).toBe("merge-pdf-tool");
  });
});

describe("Tools Config", () => {
  it("should have all required tools", async () => {
    const { PDF_TOOLS } = await import("@/lib/tools");
    expect(PDF_TOOLS.length).toBeGreaterThanOrEqual(20);

    const slugs = PDF_TOOLS.map((t) => t.slug);
    expect(slugs).toContain("merge-pdf");
    expect(slugs).toContain("split-pdf");
    expect(slugs).toContain("compress-pdf");
  });
});
