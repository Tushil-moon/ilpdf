import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const RATE_LIMIT = parseInt(process.env.RATE_LIMIT_REQUESTS ?? "100", 10);
const WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS ?? "60000", 10);

const ipRequests = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(request: NextRequest): NextResponse | null {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";

  const now = Date.now();
  const record = ipRequests.get(ip);

  if (!record || now > record.resetAt) {
    ipRequests.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return null;
  }

  if (record.count >= RATE_LIMIT) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  record.count++;
  return null;
}

export const SECURITY_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
  "Content-Security-Policy": [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.clarity.ms https://pagead2.googlesyndication.com https://www.google-analytics.com https://adservice.google.com https://www.gstatic.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: blob: https: http:",
    "font-src 'self' data: https://fonts.gstatic.com",
    "connect-src 'self' https://www.google-analytics.com https://www.clarity.ms https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net",
    "worker-src 'self' blob:",
    "frame-src https://googleads.g.doubleclick.net https://tpc.googlesyndication.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; "),
};

export const MAX_FILE_SIZE =
  parseInt(process.env.MAX_FILE_SIZE_MB ?? "50", 10) * 1024 * 1024;

export const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.ms-powerpoint",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "text/html",
];

export function validateFile(
  file: File,
  acceptedTypes: string[]
): { valid: boolean; error?: string } {
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File too large. Maximum size is ${process.env.MAX_FILE_SIZE_MB ?? 50}MB.`,
    };
  }

  if (!acceptedTypes.includes(file.type) && file.type !== "") {
    const ext = file.name.split(".").pop()?.toLowerCase();
    const extMap: Record<string, string> = {
      pdf: "application/pdf",
      docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      doc: "application/msword",
      xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      xls: "application/vnd.ms-excel",
      pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      ppt: "application/vnd.ms-powerpoint",
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      webp: "image/webp",
      gif: "image/gif",
      html: "text/html",
    };
    if (!ext || !acceptedTypes.includes(extMap[ext] ?? "")) {
      return { valid: false, error: "File type not supported." };
    }
  }

  if (!ALLOWED_MIME_TYPES.includes(file.type) && file.type !== "") {
    return { valid: false, error: "File type not allowed." };
  }

  return { valid: true };
}

export async function virusScanHook(
  buffer: Buffer
): Promise<{ clean: boolean; message?: string }> {
  const webhookUrl = process.env.VIRUS_SCAN_WEBHOOK_URL;
  if (!webhookUrl) return { clean: true };

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/octet-stream" },
      body: new Uint8Array(buffer),
    });
    const result = await response.json();
    return { clean: result.clean ?? true, message: result.message };
  } catch {
    return { clean: true };
  }
}
