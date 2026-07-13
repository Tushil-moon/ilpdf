"use client";

import { Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { ProcessStage } from "@/lib/process-progress";

export interface ProcessingStatus {
  progress: number;
  stage: ProcessStage | string;
  message: string;
}

interface ProcessingStatusProps {
  status: ProcessingStatus;
  className?: string;
}

export function ProcessingStatusPanel({ status, className }: ProcessingStatusProps) {
  const clampedProgress = Math.min(100, Math.max(0, status.progress));

  return (
    <div
      className={cn(
        "rounded-2xl border border-red-500/20 bg-gradient-to-br from-red-500/5 to-rose-500/10 p-4 sm:p-6",
        className
      )}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="flex items-start gap-3 sm:gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500/15 sm:h-12 sm:w-12">
          <Loader2 className="h-5 w-5 animate-spin text-red-500 sm:h-6 sm:w-6" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold sm:text-base">Processing your PDF</p>
              <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">{status.message}</p>
            </div>
            <span className="shrink-0 text-sm font-bold tabular-nums text-red-500 sm:text-base">
              {clampedProgress}%
            </span>
          </div>
          <Progress value={clampedProgress} className="h-2 sm:h-2.5" />
          <p className="text-[11px] text-muted-foreground sm:text-xs">
            Please keep this tab open until processing finishes.
          </p>
        </div>
      </div>
    </div>
  );
}
