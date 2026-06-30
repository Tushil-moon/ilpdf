"use client";

import { useState } from "react";
import { Trash2, RotateCw, GripVertical, Check, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { PageEditorMode } from "@/lib/tool-page-editor";
import type { EditorPage } from "@/lib/tool-page-editor";

interface PdfPageEditorProps {
  mode: PageEditorMode;
  pages: EditorPage[];
  loading?: boolean;
  error?: string | null;
  onToggleDelete: (pageId: string) => void;
  onToggleSelect: (pageId: string) => void;
  onRotate: (pageId: string) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
}

const MODE_HINTS: Record<PageEditorMode, string> = {
  "pages-delete": "Click the delete icon on pages you want to remove.",
  "pages-reorder": "Drag and drop pages to rearrange their order.",
  "pages-rotate": "Click rotate on any page to turn it 90°.",
  "pages-select": "Select the pages you want to keep or extract.",
  "pages-preview": "Review your pages, then download when ready.",
  "files-reorder": "",
  "images-reorder": "",
};

export function PdfPageEditor({
  mode,
  pages,
  loading,
  error,
  onToggleDelete,
  onToggleSelect,
  onRotate,
  onReorder,
}: PdfPageEditorProps) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-border/50 bg-card p-12">
        <Loader2 className="h-8 w-8 animate-spin text-red-500" />
        <p className="text-sm text-muted-foreground">Loading page previews...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-6 text-center text-sm text-red-600">
        {error}
      </div>
    );
  }

  if (pages.length === 0) return null;

  const canDrag = mode === "pages-reorder";

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">{MODE_HINTS[mode]}</p>
      <div
        className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
        role="list"
        aria-label="PDF pages"
      >
        {pages.map((page, index) => (
          <motion.div
            key={page.id}
            role="listitem"
            layout
            draggable={canDrag}
            onDragStart={() => setDragIndex(index)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => {
              if (dragIndex !== null && dragIndex !== index) {
                onReorder(dragIndex, index);
              }
              setDragIndex(null);
            }}
            onDragEnd={() => setDragIndex(null)}
            className={cn(
              "group relative rounded-xl border-2 bg-card overflow-hidden transition-all",
              page.markedForDeletion
                ? "border-red-500/50 opacity-50"
                : "border-border/50 hover:border-red-500/30",
              dragIndex === index && "opacity-60 scale-95",
              mode === "pages-select" && !page.selected && "opacity-40"
            )}
          >
            {canDrag && (
              <div className="absolute left-1 top-1 z-10 rounded-md bg-background/80 p-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab">
                <GripVertical className="h-4 w-4 text-muted-foreground" />
              </div>
            )}

            {mode === "pages-delete" && (
              <button
                type="button"
                onClick={() => onToggleDelete(page.id)}
                className={cn(
                  "absolute right-1 top-1 z-10 rounded-full p-1.5 shadow-md transition-colors",
                  page.markedForDeletion
                    ? "bg-red-500 text-white"
                    : "bg-background/90 text-red-500 hover:bg-red-500 hover:text-white"
                )}
                aria-label={page.markedForDeletion ? `Restore page ${page.sourceIndex}` : `Delete page ${page.sourceIndex}`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}

            {mode === "pages-rotate" && (
              <button
                type="button"
                onClick={() => onRotate(page.id)}
                className="absolute right-1 top-1 z-10 rounded-full bg-background/90 p-1.5 text-foreground shadow-md hover:bg-red-500 hover:text-white transition-colors"
                aria-label={`Rotate page ${page.sourceIndex}`}
              >
                <RotateCw className="h-4 w-4" />
              </button>
            )}

            {mode === "pages-select" && (
              <button
                type="button"
                onClick={() => onToggleSelect(page.id)}
                className={cn(
                  "absolute right-1 top-1 z-10 rounded-full p-1.5 shadow-md transition-colors",
                  page.selected
                    ? "bg-green-500 text-white"
                    : "bg-background/90 text-muted-foreground hover:bg-green-500 hover:text-white"
                )}
                aria-label={`${page.selected ? "Deselect" : "Select"} page ${page.sourceIndex}`}
              >
                <Check className="h-4 w-4" />
              </button>
            )}

            <div className="aspect-[3/4] bg-muted/30 flex items-center justify-center p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={page.thumbnail}
                alt={`Page ${page.sourceIndex}`}
                className="max-h-full max-w-full object-contain shadow-sm transition-transform"
                style={{ transform: `rotate(${page.rotation}deg)` }}
                draggable={false}
              />
            </div>

            <div className="border-t border-border/50 px-2 py-1.5 text-center text-xs font-medium text-muted-foreground">
              Page {page.sourceIndex}
              {page.rotation > 0 && ` · ${page.rotation}°`}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
