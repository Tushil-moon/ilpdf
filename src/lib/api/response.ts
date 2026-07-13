import { NextResponse } from "next/server";

export interface ApiErrorBody {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
  requestId?: string;
}

export interface ApiSuccessBody<T> {
  success: true;
  data: T;
  requestId?: string;
}

export function apiSuccess<T>(data: T, init?: ResponseInit & { requestId?: string }): NextResponse {
  const { requestId, ...responseInit } = init ?? {};
  const body: ApiSuccessBody<T> = { success: true, data };
  if (requestId) body.requestId = requestId;
  return NextResponse.json(body, responseInit);
}

export function apiError(
  status: number,
  code: string,
  message: string,
  details?: unknown,
  requestId?: string
): NextResponse {
  const body: ApiErrorBody = {
    success: false,
    error: { code, message, ...(details !== undefined ? { details } : {}) },
  };
  if (requestId) body.requestId = requestId;
  return NextResponse.json(body, { status });
}

export const API_ERROR_CODES = {
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  RATE_LIMITED: "RATE_LIMITED",
  TOOL_NOT_FOUND: "TOOL_NOT_FOUND",
  PROCESSING_FAILED: "PROCESSING_FAILED",
  FILE_NOT_FOUND: "FILE_NOT_FOUND",
  FILE_EXPIRED: "FILE_EXPIRED",
  INTERNAL_ERROR: "INTERNAL_ERROR",
} as const;
