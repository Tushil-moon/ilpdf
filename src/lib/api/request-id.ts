import { randomBytes } from "crypto";
import type { NextRequest } from "next/server";

export function getRequestId(request: NextRequest): string {
  return request.headers.get("x-request-id") ?? `req_${randomBytes(8).toString("hex")}`;
}
