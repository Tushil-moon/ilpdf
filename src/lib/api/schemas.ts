import { z } from "zod";

export const processOptionsSchema = z.record(z.string(), z.unknown());

export const createApiKeySchema = z.object({
  name: z.string().min(1).max(64),
});

export function parseJsonOptions(raw: string | null): Record<string, unknown> | undefined {
  if (!raw) return undefined;
  const parsed = JSON.parse(raw) as unknown;
  if (parsed === null || parsed === undefined) return undefined;
  return processOptionsSchema.parse(parsed);
}

export function extractFilesFromFormData(formData: FormData): File[] {
  const files: File[] = [];
  formData.forEach((value, key) => {
    if (key === "files" && value instanceof File && value.size > 0) {
      files.push(value);
    }
  });
  return files;
}
