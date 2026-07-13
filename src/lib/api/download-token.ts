import { createHmac, timingSafeEqual } from "crypto";

const TOKEN_TTL_SECONDS = parseInt(process.env.DOWNLOAD_TOKEN_TTL_SECONDS ?? "3600", 10);

function getSecret(): string {
  const secret = process.env.BETTER_AUTH_SECRET;
  if (!secret) throw new Error("BETTER_AUTH_SECRET is not configured");
  return secret;
}

export function createDownloadToken(fileId: string): string {
  const expiresAt = Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS;
  const payload = `${fileId}.${expiresAt}`;
  const signature = createHmac("sha256", getSecret()).update(payload).digest("base64url");
  return `${expiresAt}.${signature}`;
}

export function verifyDownloadToken(fileId: string, token: string): boolean {
  try {
    const [expiresAtStr, signature] = token.split(".");
    if (!expiresAtStr || !signature) return false;

    const expiresAt = parseInt(expiresAtStr, 10);
    if (Number.isNaN(expiresAt) || expiresAt < Math.floor(Date.now() / 1000)) {
      return false;
    }

    const payload = `${fileId}.${expiresAt}`;
    const expected = createHmac("sha256", getSecret()).update(payload).digest("base64url");

    const a = Buffer.from(signature);
    const b = Buffer.from(expected);
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export function appendDownloadToken(baseUrl: string, fileId: string): string {
  const token = createDownloadToken(fileId);
  const url = new URL(baseUrl, "http://localhost");
  url.searchParams.set("token", token);
  return `${url.pathname}${url.search}`;
}
