"use client";

import { useState } from "react";
import { GripVertical, FileText, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { OrderedFileCard } from "@/hooks/use-tool-page-state";

interface FileOrderEditorProps {
  files: OrderedFileCard[];
  loading?: boolean;
  error?: string | null;
  onReorder: (fromIndex: number, toIndex: number) => void;
  label?: string;
}

export function FileOrderEditor({
  files,
  loading,
  error,
  onReorder,
  label = "Drag files to set merge order",
}: FileOrderEditorProps) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-border/50 bg-card p-12">
        <Loader2 className="h-8 w-8 animate-spin text-red-500" />
        <p className="text-sm text-muted-foreground">Loading previews...</p>
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

  if (files.length === 0) return null;

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2" role="list">
        {files.map((file, index) => (
          <motion.div
            key={file.id}
            role="listitem"
            layout
            draggable
            onDragStart={() => setDragIndex(index)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => {
              if (dragIndex !== null && dragIndex !== index) onReorder(dragIndex, index);
              setDragIndex(null);
            }}
            onDragEnd={() => setDragIndex(null)}
            className={cn(
              "flex items-center gap-4 rounded-xl border-2 border-border/50 bg-card p-4 cursor-grab hover:border-red-500/30 transition-all",
              dragIndex === index && "opacity-60"
            )}
          >
            <GripVertical className="h-5 w-5 shrink-0 text-muted-foreground" />
            <div className="flex h-16 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted/30">
              {file.thumbnail ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={file.thumbnail} alt="" className="h-full w-full object-cover" />
              ) : (
                <FileText className="h-6 w-6 text-red-500" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-sm">{file.name}</p>
              <p className="text-xs text-muted-foreground">Position {index + 1}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
