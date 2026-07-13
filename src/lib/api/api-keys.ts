import { createHash, randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";

const API_KEY_PREFIX = "ilp_live_";

export function generateApiKeyValue(): string {
  return `${API_KEY_PREFIX}${randomBytes(24).toString("base64url")}`;
}

export function hashApiKey(key: string): string {
  return createHash("sha256").update(key).digest("hex");
}

export function getApiKeyPrefix(key: string): string {
  return key.slice(0, 12);
}

export async function verifyApiKey(
  rawKey: string
): Promise<{ userId: string; keyId: string } | null> {
  if (!rawKey.startsWith(API_KEY_PREFIX)) return null;

  const keyHash = hashApiKey(rawKey);
  const record = await prisma.apiKey.findUnique({
    where: { keyHash },
    select: { id: true, userId: true, expiresAt: true },
  });

  if (!record) return null;
  if (record.expiresAt && record.expiresAt < new Date()) return null;

  await prisma.apiKey.update({
    where: { id: record.id },
    data: { lastUsed: new Date() },
  });

  return { userId: record.userId, keyId: record.id };
}

export async function createApiKeyForUser(userId: string, name: string) {
  const rawKey = generateApiKeyValue();
  const keyHash = hashApiKey(rawKey);
  const prefix = getApiKeyPrefix(rawKey);

  const record = await prisma.apiKey.create({
    data: { userId, name, keyHash, prefix },
    select: { id: true, name: true, prefix: true, createdAt: true },
  });

  return { ...record, key: rawKey };
}
