"use client";

import { useCallback, useEffect, useState } from "react";
import type { UploadFile } from "@/types";
import {
  getPageEditorMode,
  usesPageEditor,
  buildOptionsFromPages,
  buildOptionsFromFileOrder,
  type EditorPage,
} from "@/lib/tool-page-editor";
import { loadPdfPageThumbnails, loadImageThumbnail } from "@/lib/pdf-page-preview";
import { generateId } from "@/lib/utils";
import type { ProcessOptions } from "@/types";

export interface OrderedFileCard {
  id: string;
  uploadId: string;
  name: string;
  thumbnail: string;
}

export function useToolPageState(toolSlug: string, activeFiles: UploadFile[]) {
  const mode = getPageEditorMode(toolSlug);
  const enabled = usesPageEditor(toolSlug) && activeFiles.length > 0;

  const [pages, setPages] = useState<EditorPage[]>([]);
  const [fileCards, setFileCards] = useState<OrderedFileCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileKey = activeFiles.map((f) => `${f.id}:${f.file.name}:${f.file.size}`).join("|");

  useEffect(() => {
    if (!enabled || !mode) {
      setPages([]);
      setFileCards([]);
      return;
    }

    let cancelled = false;

    async function load() {
      if (!mode) return;
      setLoading(true);
      setError(null);
      try {
        if (mode.startsWith("pages")) {
          const thumbs = await loadPdfPageThumbnails(activeFiles[0].file);
          if (!cancelled) setPages(thumbs);
        } else if (mode === "files-reorder") {
          const cards: OrderedFileCard[] = [];
          for (const upload of activeFiles) {
            let thumbnail = "";
            try {
              const pageThumbs = await loadPdfPageThumbnails(upload.file);
              thumbnail = pageThumbs[0]?.thumbnail ?? "";
            } catch {
              thumbnail = "";
            }
            cards.push({
              id: generateId(),
              uploadId: upload.id,
              name: upload.file.name,
              thumbnail,
            });
          }
          if (!cancelled) setFileCards(cards);
        } else if (mode === "images-reorder") {
          const cards: OrderedFileCard[] = [];
          for (const upload of activeFiles) {
            const thumbnail = await loadImageThumbnail(upload.file);
            cards.push({
              id: generateId(),
              uploadId: upload.id,
              name: upload.file.name,
              thumbnail,
            });
          }
          if (!cancelled) setFileCards(cards);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load preview");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [enabled, mode, fileKey, activeFiles]);

  const toggleDelete = useCallback((pageId: string) => {
    setPages((prev) =>
      prev.map((p) =>
        p.id === pageId ? { ...p, markedForDeletion: !p.markedForDeletion } : p
      )
    );
  }, []);

  const toggleSelect = useCallback((pageId: string) => {
    setPages((prev) =>
      prev.map((p) => (p.id === pageId ? { ...p, selected: !p.selected } : p))
    );
  }, []);

  const rotatePage = useCallback((pageId: string) => {
    setPages((prev) =>
      prev.map((p) =>
        p.id === pageId ? { ...p, rotation: (p.rotation + 90) % 360 } : p
      )
    );
  }, []);

  const reorderPages = useCallback((fromIndex: number, toIndex: number) => {
    setPages((prev) => {
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  }, []);

  const reorderFiles = useCallback((fromIndex: number, toIndex: number) => {
    setFileCards((prev) => {
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  }, []);

  const buildProcessOptions = useCallback(
    (baseOptions: ProcessOptions): ProcessOptions => {
      if (!mode) return baseOptions;

      if (mode.startsWith("pages")) {
        return buildOptionsFromPages(toolSlug, pages, baseOptions);
      }

      if (mode === "files-reorder" || mode === "images-reorder") {
        const order = fileCards.map((c) => c.uploadId);
        return buildOptionsFromFileOrder(order, baseOptions);
      }

      return baseOptions;
    },
    [mode, toolSlug, pages, fileCards]
  );

  const canProcess = useCallback((): boolean => {
    if (!enabled) return true;
    if (loading || error) return false;

    if (mode === "pages-delete") {
      return pages.some((p) => p.markedForDeletion) && pages.some((p) => !p.markedForDeletion);
    }
    if (mode === "pages-select") {
      return pages.some((p) => p.selected);
    }
    if (mode?.startsWith("pages")) {
      return pages.filter((p) => !p.markedForDeletion).length > 0;
    }
    if (mode === "files-reorder" || mode === "images-reorder") {
      return fileCards.length > 0;
    }
    return true;
  }, [enabled, loading, error, mode, pages, fileCards]);

  return {
    mode,
    enabled,
    pages,
    fileCards,
    loading,
    error,
    toggleDelete,
    toggleSelect,
    rotatePage,
    reorderPages,
    reorderFiles,
    buildProcessOptions,
    canProcess,
  };
}
