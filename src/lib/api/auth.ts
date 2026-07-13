import type { NextRequest } from "next/server";
import { getCurrentUserId } from "@/lib/auth-server";
import { verifyApiKey } from "@/lib/api/api-keys";

export interface ApiAuthContext {
  userId: string | null;
  apiKeyId: string | null;
  authMethod: "session" | "api_key" | "anonymous";
}

function extractBearerToken(request: NextRequest): string | null {
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) return null;
  return header.slice(7).trim();
}

export async function resolveApiAuth(request: NextRequest): Promise<ApiAuthContext> {
  const bearer = extractBearerToken(request);
  if (bearer) {
    const apiKey = await verifyApiKey(bearer);
    if (apiKey) {
      return {
        userId: apiKey.userId,
        apiKeyId: apiKey.keyId,
        authMethod: "api_key",
      };
    }
  }

  const sessionUserId = await getCurrentUserId();
  if (sessionUserId) {
    return {
      userId: sessionUserId,
      apiKeyId: null,
      authMethod: "session",
    };
  }

  return { userId: null, apiKeyId: null, authMethod: "anonymous" };
}

export async function canAccessFile(
  auth: ApiAuthContext,
  file: { userId: string | null; id: string },
  downloadToken?: string | null
): Promise<boolean> {
  if (downloadToken) {
    const { verifyDownloadToken } = await import("@/lib/api/download-token");
    if (verifyDownloadToken(file.id, downloadToken)) return true;
  }

  if (file.userId) {
    return auth.userId === file.userId;
  }

  return false;
}
