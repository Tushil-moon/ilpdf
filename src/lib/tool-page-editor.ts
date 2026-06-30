import type { ProcessOptions } from "@/types";

export type PageEditorMode =
  | "pages-delete"
  | "pages-reorder"
  | "pages-rotate"
  | "pages-select"
  | "pages-preview"
  | "files-reorder"
  | "images-reorder";

export interface EditorPage {
  id: string;
  sourceIndex: number;
  thumbnail: string;
  rotation: number;
  markedForDeletion: boolean;
  selected: boolean;
}

export const TOOL_PAGE_EDITOR: Partial<Record<string, PageEditorMode>> = {
  "delete-pages": "pages-delete",
  "organize-pdf": "pages-reorder",
  "rotate-pdf": "pages-rotate",
  "extract-pages": "pages-select",
  "split-pdf": "pages-select",
  "compress-pdf": "pages-preview",
  "protect-pdf": "pages-preview",
  "watermark-pdf": "pages-preview",
  "page-numbers": "pages-preview",
  "repair-pdf": "pages-preview",
  "merge-pdf": "files-reorder",
  "jpg-to-pdf": "images-reorder",
};

export const VISUAL_OPTION_TOOLS = new Set([
  "delete-pages",
  "organize-pdf",
  "rotate-pdf",
  "extract-pages",
  "split-pdf",
]);

export function getPageEditorMode(toolSlug: string): PageEditorMode | null {
  return TOOL_PAGE_EDITOR[toolSlug] ?? null;
}

export function usesPageEditor(toolSlug: string): boolean {
  return toolSlug in TOOL_PAGE_EDITOR;
}

export function buildOptionsFromPages(
  toolSlug: string,
  pages: EditorPage[],
  baseOptions: ProcessOptions = {}
): ProcessOptions {
  const active = pages.filter((p) => !p.markedForDeletion);

  switch (toolSlug) {
    case "delete-pages": {
      const toDelete = pages.filter((p) => p.markedForDeletion).map((p) => p.sourceIndex);
      if (toDelete.length === 0) return { ...baseOptions, pages: "" };
      return { ...baseOptions, pages: toDelete.join(",") };
    }
    case "organize-pdf":
      return { ...baseOptions, pageOrder: active.map((p) => p.sourceIndex) };
    case "rotate-pdf": {
      const pageRotations: Record<number, number> = {};
      for (const page of pages) {
        if (page.rotation) pageRotations[page.sourceIndex] = page.rotation;
      }
      return { ...baseOptions, pageRotations };
    }
    case "extract-pages":
    case "split-pdf": {
      const selected = pages.filter((p) => p.selected).map((p) => p.sourceIndex);
      return { ...baseOptions, pageRanges: selected.length ? selected.join(",") : "1" };
    }
    default:
      return baseOptions;
  }
}

export function buildOptionsFromFileOrder(
  fileOrder: string[],
  baseOptions: ProcessOptions = {}
): ProcessOptions {
  return { ...baseOptions, fileOrder };
}
