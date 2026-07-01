"use client";

import { useCallback, useState } from "react";
import type { UploadFile, ProcessOptions } from "@/types";
import type { PdfTool } from "@/types";
import { generateId } from "@/lib/utils";
import { validateFile } from "@/lib/security";
import { getClientProcessor, isServerOnlyTool } from "@/services/pdf-client";
import { authClient } from "@/lib/auth-client";

async function parseApiError(response: Response): Promise<string> {
  const text = await response.text();
  try {
    const json = JSON.parse(text) as { error?: string };
    return json.error ?? "Server processing failed";
  } catch {
    return text.slice(0, 200) || `Server error (${response.status})`;
  }
}

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

async function saveClientResultForUser(
  blob: Blob,
  fileName: string,
  mimeType: string,
  toolSlug: string,
  originalName: string
): Promise<{ url: string; name: string; fileId: string } | null> {
  const formData = new FormData();
  formData.append("file", blob, fileName);
  formData.append("toolSlug", toolSlug);
  formData.append("originalName", originalName);

  const response = await fetch("/api/record", {
    method: "POST",
    body: formData,
    credentials: "same-origin",
  });

  if (!response.ok) return null;

  const data = await response.json();
  return {
    url: data.downloadUrl as string,
    name: (data.fileName as string) ?? fileName,
    fileId: data.fileId as string,
  };
}

export function useUploadQueue(tool: PdfTool) {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{
    url: string;
    name: string;
    fileId?: string;
  } | null>(null);

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
      const formData = new FormData();
      activeFiles.forEach((f) => formData.append("files", f.file));
      formData.append("toolSlug", tool.slug);
      if (options) formData.append("options", JSON.stringify(options));

      setFiles((prev) =>
        prev.map((f) =>
          activeFiles.find((af) => af.id === f.id)
            ? { ...f, status: "uploading" as const, progress: 20 }
            : f
        )
      );

      const response = await fetch("/api/process", { method: "POST", body: formData });

      setFiles((prev) =>
        prev.map((f) =>
          activeFiles.find((af) => af.id === f.id)
            ? { ...f, status: "processing" as const, progress: 60 }
            : f
        )
      );

      if (!response.ok) {
        const err = await parseApiError(response);
        throw new Error(err);
      }

      const data = await response.json();
      return {
        url: data.downloadUrl as string,
        name: (data.fileName as string) ?? "result",
        fileId: data.fileId as string | undefined,
      };
    },
    [tool.slug]
  );

  const processFiles = useCallback(
    async (options?: ProcessOptions) => {
      const activeFiles = orderUploadFiles(
        files.filter((f) => f.status === "pending" || f.status === "error"),
        options
      );
      if (activeFiles.length === 0) return;

      setIsProcessing(true);
      setResult(null);

      try {
        const useServer = isServerOnlyTool(tool.slug);
        const clientProcessor = getClientProcessor(tool.slug);

        let output: { url: string; name: string; fileId?: string };

        if (useServer || !clientProcessor) {
          output = await processViaServer(activeFiles, options);
        } else {
          setFiles((prev) =>
            prev.map((f) =>
              activeFiles.find((af) => af.id === f.id)
                ? { ...f, status: "processing" as const, progress: 30 }
                : f
            )
          );

          const buffers = await Promise.all(
            activeFiles.map(async (f) => new Uint8Array(await f.file.arrayBuffer()))
          );

          const jobResult = await clientProcessor(buffers, options);
          if (!jobResult.success || !jobResult.data) {
            throw new Error(jobResult.error ?? "Processing failed");
          }

          const blob = new Blob([new Uint8Array(jobResult.data)], {
            type: jobResult.mimeType,
          });
          const fileName = jobResult.fileName ?? "result.pdf";
          const blobUrl = URL.createObjectURL(blob);

          output = {
            url: blobUrl,
            name: fileName,
          };

          const session = await authClient.getSession();
          if (session?.data?.user) {
            const saved = await saveClientResultForUser(
              blob,
              fileName,
              jobResult.mimeType ?? "application/pdf",
              tool.slug,
              activeFiles[0]?.file.name ?? fileName
            );
            if (saved) {
              URL.revokeObjectURL(blobUrl);
              output = saved;
            }
          }
        }

        setFiles((prev) =>
          prev.map((f) =>
            activeFiles.find((af) => af.id === f.id)
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
        setFiles((prev) =>
          prev.map((f) =>
            activeFiles.find((af) => af.id === f.id)
              ? { ...f, status: "error" as const, error: message }
              : f
          )
        );
      } finally {
        setIsProcessing(false);
      }
    },
    [files, tool, processViaServer]
  );

  const reset = useCallback(() => {
    files.forEach((f) => {
      if (f.resultUrl?.startsWith("blob:")) URL.revokeObjectURL(f.resultUrl);
    });
    setFiles([]);
    setResult(null);
    setIsProcessing(false);
  }, [files]);

  return {
    files,
    isProcessing,
    result,
    addFiles,
    removeFile,
    cancelFile,
    retryFile,
    processFiles,
    reset,
  };
}
