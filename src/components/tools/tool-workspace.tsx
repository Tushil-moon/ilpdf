"use client";

import { useState, useCallback, useMemo } from "react";
import type { PdfTool, ProcessOptions } from "@/types";
import { useUploadQueue } from "@/hooks/use-upload-queue";
import { useToolPageState } from "@/hooks/use-tool-page-state";
import { FileUploadZone } from "@/components/tools/file-upload-zone";
import { ToolOptions } from "@/components/tools/tool-options";
import { ToolPageAds } from "@/components/ads/ad-placements";
import { usesPageEditor } from "@/lib/tool-page-editor";

interface ToolWorkspaceProps {
  tool: PdfTool;
}

export function ToolWorkspace({ tool }: ToolWorkspaceProps) {
  const [options, setOptions] = useState<ProcessOptions>({});

  const {
    files,
    isProcessing,
    result,
    addFiles,
    removeFile,
    cancelFile,
    retryFile,
    processFiles,
    reset,
  } = useUploadQueue(tool);

  const activeFiles = useMemo(
    () => files.filter((f) => f.status !== "cancelled"),
    [files]
  );

  const pageState = useToolPageState(tool.slug, activeFiles);

  const handleProcess = useCallback(() => {
    const mergedOptions = pageState.enabled
      ? pageState.buildProcessOptions(options)
      : options;
    processFiles(mergedOptions);
  }, [processFiles, options, pageState]);

  const showEditor = usesPageEditor(tool.slug) && activeFiles.length > 0 && !result;
  const canProcess = pageState.enabled ? pageState.canProcess() : activeFiles.some(
    (f) => f.status === "pending" || f.status === "error"
  );

  return (
    <div className={showEditor ? "mx-auto max-w-6xl space-y-8" : "mx-auto max-w-3xl space-y-8"}>
      <ToolOptions tool={tool} options={options} onOptionsChange={setOptions} />
      <FileUploadZone
        tool={tool}
        files={files}
        isProcessing={isProcessing}
        onFilesAdded={addFiles}
        onRemove={removeFile}
        onCancel={cancelFile}
        onRetry={retryFile}
        onProcess={handleProcess}
        onReset={reset}
        result={result}
        pageState={showEditor ? pageState : null}
        canProcess={canProcess}
      />
      <ToolPageAds />
    </div>
  );
}
