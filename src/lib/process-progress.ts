export type ProcessStage =
  | "preparing"
  | "uploading"
  | "reading"
  | "validating"
  | "processing"
  | "merging"
  | "converting"
  | "saving"
  | "finalizing"
  | "complete"
  | "error";

export interface ProgressUpdate {
  progress: number;
  stage: ProcessStage;
  message: string;
}

export type ProgressReporter = (update: ProgressUpdate) => void;

export interface StreamProgressEvent {
  type: "progress";
  progress: number;
  stage: ProcessStage;
  message: string;
}

export interface StreamCompleteEvent {
  type: "complete";
  downloadUrl: string;
  fileName: string;
  fileId?: string;
  jobId?: string;
  mimeType?: string;
}

export interface StreamErrorEvent {
  type: "error";
  error: string;
}

export type ProcessStreamEvent = StreamProgressEvent | StreamCompleteEvent | StreamErrorEvent;

export function stripProgressCallback(options?: Record<string, unknown>): Record<string, unknown> | undefined {
  if (!options) return undefined;
  const rest = { ...options };
  delete rest.onProgress;
  return rest;
}

export async function readProcessStream(
  response: Response,
  onProgress: ProgressReporter
): Promise<StreamCompleteEvent> {
  if (!response.ok) {
    const text = await response.text();
    try {
      const json = JSON.parse(text) as { error?: string };
      throw new Error(json.error ?? "Server processing failed");
    } catch {
      throw new Error(text.slice(0, 200) || `Server error (${response.status})`);
    }
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error("No response stream");
  }

  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (!line.trim()) continue;
      const event = JSON.parse(line) as ProcessStreamEvent;

      if (event.type === "progress") {
        onProgress({
          progress: event.progress,
          stage: event.stage,
          message: event.message,
        });
      }

      if (event.type === "error") {
        throw new Error(event.error);
      }

      if (event.type === "complete") {
        onProgress({
          progress: 100,
          stage: "complete",
          message: "Your file is ready!",
        });
        return event;
      }
    }
  }

  throw new Error("Processing ended unexpectedly");
}
