"use client";

import { useCallback, useState } from "react";
import type { UploadFile, ProcessOptions } from "@/types";
import type { PdfTool } from "@/types";
import { generateId } from "@/lib/utils";
import { validateFile } from "@/lib/security";
import {
  readProcessStream,
  stripProgressCallback,
  type ProgressUpdate,
} from "@/lib/process-progress";
import type { ProcessingStatus } from "@/components/tools/processing-status";

function orderUploadFiles(
  activeFiles: UploadFile[],
  options?: ProcessOptions
): UploadFile[] {
  const order = options?.fileOrder as string[] | undefined;
  if (!order?.length) return activeFiles;
  const byId = new Map(activeFiles.map((f) => [f.id, f]));
  const ordered = order.map((id) => byId.get(id)).filter((f): f is UploadFile => !!f);
  return ordered.length > 0 ? ordered : activeFiles;
}

export function useUploadQueue(tool: PdfTool) {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatus | null>(null);
  const [result, setResult] = useState<{
    url: string;
    name: string;
    fileId?: string;
    jobId?: string;
  } | null>(null);

  const applyProgress = useCallback((activeIds: string[], update: ProgressUpdate) => {
    setProcessingStatus({
      progress: update.progress,
      stage: update.stage,
      message: update.message,
    });

    const status =
      update.progress >= 100
        ? ("completed" as const)
        : update.stage === "uploading"
          ? ("uploading" as const)
          : ("processing" as const);

    setFiles((prev) =>
      prev.map((f) =>
        activeIds.includes(f.id)
          ? {
              ...f,
              progress: update.progress,
              status,
              stage: update.stage,
              stageMessage: update.message,
            }
          : f
      )
    );
  }, []);

  const addFiles = useCallback(
    (newFiles: FileList | File[]) => {
      const fileArray = Array.from(newFiles);
      const currentCount = files.filter((f) => f.status !== "cancelled").length;
      const toAdd = fileArray.slice(0, tool.maxFiles - currentCount).map((file) => {
        const validation = validateFile(file, tool.acceptedTypes);
        return {
          id: generateId(),
          file,
          progress: 0,
          status: validation.valid ? ("pending" as const) : ("error" as const),
          error: validation.error,
        };
      });
      setFiles((prev) => [...prev, ...toAdd]);
      setResult(null);
    },
    [files, tool]
  );

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const cancelFile = useCallback((id: string) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, status: "cancelled" as const } : f))
    );
  }, []);

  const retryFile = useCallback((id: string) => {
    setFiles((prev) =>
      prev.map((f) =>
        f.id === id
          ? { ...f, status: "pending" as const, progress: 0, error: undefined }
          : f
      )
    );
  }, []);

  const processViaServer = useCallback(
    async (activeFiles: UploadFile[], options?: ProcessOptions) => {
      const activeIds = activeFiles.map((f) => f.id);
      const formData = new FormData();
      activeFiles.forEach((f) => formData.append("files", f.file));
      if (options) {
        formData.append("options", JSON.stringify(stripProgressCallback(options)));
      }

      applyProgress(activeIds, {
        progress: 5,
        stage: "uploading",
        message: "Uploading files to server...",
      });

      const response = await fetch(`/api/v1/tools/${tool.slug}/process`, {
        method: "POST",
        body: formData,
        credentials: "same-origin",
      });

      const complete = await readProcessStream(response, (update) =>
        applyProgress(activeIds, update)
      );

      return {
        url: complete.downloadUrl,
        name: complete.fileName ?? "result",
        fileId: complete.fileId,
        jobId: complete.jobId,
      };
    },
    [tool.slug, applyProgress]
  );

  const processFiles = useCallback(
    async (options?: ProcessOptions) => {
      const activeFiles = orderUploadFiles(
        files.filter((f) => f.status === "pending" || f.status === "error"),
        options
      );
      if (activeFiles.length === 0) return;

      const activeIds = activeFiles.map((f) => f.id);

      setIsProcessing(true);
      setResult(null);
      setProcessingStatus({
        progress: 2,
        stage: "preparing",
        message: "Starting...",
      });

      try {
        const output = await processViaServer(activeFiles, options);

        applyProgress(activeIds, {
          progress: 100,
          stage: "complete",
          message: "Your file is ready!",
        });

        setFiles((prev) =>
          prev.map((f) =>
            activeIds.includes(f.id)
              ? {
                  ...f,
                  status: "completed" as const,
                  progress: 100,
                  resultUrl: output.url,
                  resultName: output.name,
                }
              : f
          )
        );

        setResult(output);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Processing failed";
        setProcessingStatus({
          progress: 0,
          stage: "error",
          message,
        });
        setFiles((prev) =>
          prev.map((f) =>
            activeIds.includes(f.id)
              ? { ...f, status: "error" as const, error: message, progress: 0 }
              : f
          )
        );
      } finally {
        setIsProcessing(false);
        setProcessingStatus(null);
      }
    },
    [files, processViaServer, applyProgress]
  );

  const reset = useCallback(() => {
    setFiles([]);
    setResult(null);
    setIsProcessing(false);
    setProcessingStatus(null);
  }, []);

  return {
    files,
    isProcessing,
    processingStatus,
    result,
    addFiles,
    removeFile,
    cancelFile,
    retryFile,
    processFiles,
    reset,
  };
}
