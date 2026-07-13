"use client";

import { useCallback, useState, useRef } from "react";
import { Upload, X, FileText, RefreshCw, CheckCircle, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn, formatFileSize } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { DownloadButton } from "@/components/tools/download-button";
import { PdfPageEditor } from "@/components/tools/pdf-page-editor";
import { FileOrderEditor } from "@/components/tools/file-order-editor";
import {
  ProcessingStatusPanel,
  type ProcessingStatus,
} from "@/components/tools/processing-status";
import type { UploadFile } from "@/types";
import type { PdfTool } from "@/types";
import type { useToolPageState } from "@/hooks/use-tool-page-state";

type PageState = ReturnType<typeof useToolPageState>;

interface FileUploadZoneProps {
  tool: PdfTool;
  files: UploadFile[];
  isProcessing: boolean;
  processingStatus?: ProcessingStatus | null;
  onFilesAdded: (files: FileList | File[]) => void;
  onRemove: (id: string) => void;
  onCancel: (id: string) => void;
  onRetry: (id: string) => void;
  onProcess: () => void;
  onReset: () => void;
  result: { url: string; name: string } | null;
  pageState?: PageState | null;
  canProcess?: boolean;
}

export function FileUploadZone({
  tool,
  files,
  isProcessing,
  processingStatus,
  onFilesAdded,
  onRemove,
  onCancel,
  onRetry,
  onProcess,
  onReset,
  result,
  pageState,
  canProcess = true,
}: FileUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files.length > 0) {
        onFilesAdded(e.dataTransfer.files);
      }
    },
    [onFilesAdded]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const activeFiles = files.filter((f) => f.status !== "cancelled");
  const canAddMore = activeFiles.length < tool.maxFiles;
  const hasPending = activeFiles.some(
    (f) => f.status === "pending" || f.status === "error"
  );
  const showPageEditor = pageState?.enabled && hasPending;

  if (result) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-4 rounded-2xl border-2 border-green-500/30 bg-green-500/5 p-6 text-center sm:gap-6 sm:rounded-3xl sm:p-12"
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20 sm:h-20 sm:w-20">
          <CheckCircle className="h-8 w-8 text-green-500 sm:h-10 sm:w-10" aria-hidden="true" />
        </div>
        <div>
          <h3 className="text-xl font-bold sm:text-2xl">Your file is ready!</h3>
          <p className="mt-2 break-all text-sm text-muted-foreground sm:text-base">{result.name}</p>
        </div>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:gap-4">
          <DownloadButton url={result.url} fileName={result.name} className="w-full sm:w-auto" />
          <Button variant="outline" size="lg" onClick={onReset} className="w-full sm:w-auto">
            Process Another
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {canAddMore && !isProcessing && (
        <div
          role="button"
          tabIndex={0}
          aria-label={`Upload files for ${tool.name}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
          }}
          onClick={() => inputRef.current?.click()}
          className={cn(
            "relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 transition-all duration-300 sm:rounded-3xl sm:p-10 md:p-12",
            isDragging
              ? "border-red-500 bg-red-500/5 scale-[1.01]"
              : "border-border hover:border-red-500/50 hover:bg-accent/50",
            showPageEditor && "p-5 sm:p-8"
          )}
        >
          <motion.div
            animate={isDragging ? { scale: 1.05 } : { scale: 1 }}
            className="flex flex-col items-center gap-3 sm:gap-4"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 shadow-lg shadow-red-500/25 sm:h-16 sm:w-16">
              <Upload className="h-7 w-7 text-white sm:h-8 sm:w-8" aria-hidden="true" />
            </div>
            <div className="text-center">
              <p className="text-base font-semibold sm:text-lg">
                {showPageEditor ? "Add more files" : "Drop your files here"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                or tap to browse • Max {process.env.NEXT_PUBLIC_MAX_FILE_SIZE_MB ?? 50}MB
              </p>
            </div>
          </motion.div>
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            accept={tool.acceptedTypes.join(",")}
            multiple={tool.multiFile}
            onChange={(e) => {
              if (e.target.files) onFilesAdded(e.target.files);
              e.target.value = "";
            }}
          />
        </div>
      )}

      {isProcessing && processingStatus && (
        <ProcessingStatusPanel status={processingStatus} />
      )}

      {!showPageEditor && (
        <AnimatePresence>
          {activeFiles.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2 sm:space-y-3"
              role="list"
              aria-label="Upload queue"
            >
              {activeFiles.map((file) => (
                <FileListItem
                  key={file.id}
                  file={file}
                  onRetry={onRetry}
                  onCancel={onCancel}
                  onRemove={onRemove}
                  suppressProgress={isProcessing}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {showPageEditor && pageState && (
        <div className="rounded-xl border border-border/50 bg-card p-4 space-y-4 sm:rounded-2xl sm:p-6 sm:space-y-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <h3 className="truncate font-semibold text-sm sm:text-base">
              {activeFiles.length === 1
                ? activeFiles[0].file.name
                : `${activeFiles.length} files`}
            </h3>
            {activeFiles.length === 1 && (
              <Button
                variant="ghost"
                size="sm"
                className="self-start"
                onClick={() => onRemove(activeFiles[0].id)}
              >
                <X className="h-4 w-4 mr-1" />
                Remove
              </Button>
            )}
          </div>

          {pageState.mode?.startsWith("pages") && (
            <PdfPageEditor
              mode={pageState.mode}
              pages={pageState.pages}
              loading={pageState.loading}
              error={pageState.error}
              onToggleDelete={pageState.toggleDelete}
              onToggleSelect={pageState.toggleSelect}
              onRotate={pageState.rotatePage}
              onReorder={pageState.reorderPages}
            />
          )}

          {(pageState.mode === "files-reorder" ||
            pageState.mode === "images-reorder") && (
            <FileOrderEditor
              files={pageState.fileCards}
              loading={pageState.loading}
              error={pageState.error}
              onReorder={pageState.reorderFiles}
              label={
                pageState.mode === "files-reorder"
                  ? "Drag files to set merge order"
                  : "Drag images to set page order in the PDF"
              }
            />
          )}

          {pageState.mode === "files-reorder" && activeFiles.length > 1 && (
            <div className="space-y-2">
              {activeFiles.map((file) => (
                <FileListItem
                  key={file.id}
                  file={file}
                  onRetry={onRetry}
                  onCancel={onCancel}
                  onRemove={onRemove}
                  compact
                  suppressProgress={isProcessing}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {hasPending && (
        <div className="sticky bottom-3 z-10 flex flex-col items-stretch gap-2 rounded-xl border border-border/50 bg-background/95 p-3 shadow-lg backdrop-blur-sm sm:static sm:items-center sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none">
          <Button
            size="lg"
            onClick={onProcess}
            disabled={isProcessing || !canProcess}
            className="w-full sm:min-w-[220px] sm:w-auto"
          >
            {isProcessing
              ? processingStatus?.message ?? "Processing..."
              : showPageEditor
                ? "Download PDF"
                : `Process ${tool.name}`}
          </Button>
          {showPageEditor && !canProcess && !pageState?.loading && (
            <p className="text-center text-xs text-muted-foreground">
              {pageState?.mode === "pages-delete"
                ? "Mark at least one page to delete"
                : pageState?.mode === "pages-select"
                  ? "Select at least one page"
                  : "Adjust your pages to continue"}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function FileListItem({
  file,
  onRetry,
  onCancel,
  onRemove,
  compact,
  suppressProgress,
}: {
  file: UploadFile;
  onRetry: (id: string) => void;
  onCancel: (id: string) => void;
  onRemove: (id: string) => void;
  compact?: boolean;
  suppressProgress?: boolean;
}) {
  const isActive = file.status === "uploading" || file.status === "processing";
  const showProgress = isActive && !suppressProgress;

  return (
    <motion.div
      role="listitem"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className={cn(
        "flex flex-col gap-2 rounded-xl border border-border/50 bg-card sm:flex-row sm:items-center sm:gap-4 sm:rounded-2xl",
        compact ? "p-3" : "p-3 sm:p-4"
      )}
    >
      <div className="flex min-w-0 items-center gap-3 sm:gap-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-500/10 sm:h-10 sm:w-10">
          {file.status === "error" ? (
            <AlertCircle className="h-5 w-5 text-red-500" />
          ) : file.status === "completed" ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
          ) : (
            <FileText className="h-5 w-5 text-red-500" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium sm:text-base">{file.file.name}</p>
          <p className="text-xs text-muted-foreground">{formatFileSize(file.file.size)}</p>
        </div>
        <div className="flex shrink-0 gap-1 sm:order-last">
          {file.status === "error" && (
            <Button variant="ghost" size="icon" onClick={() => onRetry(file.id)} aria-label="Retry">
              <RefreshCw className="h-4 w-4" />
            </Button>
          )}
          {isActive && (
            <Button variant="ghost" size="icon" onClick={() => onCancel(file.id)} aria-label="Cancel">
              <X className="h-4 w-4" />
            </Button>
          )}
          {!isActive && (
            <Button variant="ghost" size="icon" onClick={() => onRemove(file.id)} aria-label="Remove">
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {showProgress && (
        <div className="w-full space-y-1 sm:min-w-[140px] sm:max-w-[180px]">
          <div className="flex items-center justify-between gap-2 text-[11px] text-muted-foreground sm:text-xs">
            <span className="truncate">{file.stageMessage ?? "Processing..."}</span>
            <span className="shrink-0 tabular-nums font-medium text-foreground">{file.progress}%</span>
          </div>
          <Progress value={file.progress} className="h-1.5" />
        </div>
      )}

      {file.error && <p className="text-xs text-red-500 sm:col-span-full">{file.error}</p>}
    </motion.div>
  );
}
