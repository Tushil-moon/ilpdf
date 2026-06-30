import { Queue, Worker, type Job, type ConnectionOptions } from "bullmq";
import type { ProcessOptions } from "@/types";

const connection: ConnectionOptions = {
  host: process.env.REDIS_HOST ?? "localhost",
  port: parseInt(process.env.REDIS_PORT ?? "6379", 10),
  maxRetriesPerRequest: null,
};

export const pdfQueue = new Queue("pdf-processing", { connection });

export interface PdfJobData {
  jobId: string;
  fileId: string;
  toolSlug: string;
  storageKey: string;
  options?: ProcessOptions;
}

export async function enqueuePdfJob(data: PdfJobData): Promise<string> {
  const job = await pdfQueue.add(data.toolSlug, data, {
    attempts: 3,
    backoff: { type: "exponential", delay: 2000 },
    removeOnComplete: { age: 3600 },
    removeOnFail: { age: 86400 },
  });
  return job.id ?? "";
}

export function createPdfWorker(
  processor: (job: Job<PdfJobData>) => Promise<void>
): Worker<PdfJobData> {
  return new Worker<PdfJobData>("pdf-processing", processor, {
    connection,
    concurrency: 5,
  });
}

export async function getJobProgress(bullJobId: string): Promise<number> {
  const job = await pdfQueue.getJob(bullJobId);
  if (!job) return 0;
  return (job.progress as number) ?? 0;
}
