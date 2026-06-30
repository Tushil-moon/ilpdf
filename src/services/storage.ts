import { mkdir, writeFile, readFile, unlink } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const UPLOAD_DIR = join(process.cwd(), ".uploads");
const BUCKET = process.env.S3_BUCKET ?? "ilpdf-uploads";
const USE_S3 = !!(process.env.S3_ACCESS_KEY_ID && process.env.S3_SECRET_ACCESS_KEY);

const s3Client = USE_S3
  ? new S3Client({
      region: process.env.S3_REGION ?? "auto",
      endpoint: process.env.S3_ENDPOINT || undefined,
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID!,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
      },
      forcePathStyle: !!process.env.S3_ENDPOINT,
    })
  : null;

/** Convert logical storage key to local filesystem path */
export function localPathFromKey(key: string): string {
  return join(UPLOAD_DIR, key.replace(/\//g, "_"));
}

export async function ensureUploadDir(): Promise<void> {
  if (!USE_S3 && !existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true });
  }
}

export async function storeFile(
  key: string,
  body: Buffer | Uint8Array,
  _contentType: string
): Promise<string> {
  if (USE_S3 && s3Client) {
    await s3Client.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: body,
        ContentType: _contentType,
      })
    );
    return key;
  }

  await ensureUploadDir();
  const filePath = localPathFromKey(key);
  await writeFile(filePath, Buffer.from(body));
  return key;
}

export async function readStoredFile(key: string): Promise<Buffer> {
  if (USE_S3 && s3Client) {
    const response = await s3Client.send(
      new GetObjectCommand({ Bucket: BUCKET, Key: key })
    );
    const stream = response.Body;
    if (!stream) throw new Error("Empty S3 response");
    const chunks: Uint8Array[] = [];
    for await (const chunk of stream as AsyncIterable<Uint8Array>) {
      chunks.push(chunk);
    }
    return Buffer.concat(chunks);
  }

  const filePath = localPathFromKey(key);
  if (!existsSync(filePath)) {
    throw new Error(`File not found on disk: ${key}`);
  }
  return readFile(filePath);
}

export async function deleteStoredFile(key: string): Promise<void> {
  if (USE_S3 && s3Client) {
    await s3Client.send(
      new DeleteObjectCommand({ Bucket: BUCKET, Key: key })
    );
    return;
  }
  await unlink(localPathFromKey(key)).catch(() => {});
}

export async function getDownloadUrl(
  _key: string,
  fileId: string,
  expiresIn = 3600
): Promise<string> {
  if (USE_S3 && s3Client) {
    return getSignedUrl(
      s3Client,
      new GetObjectCommand({ Bucket: BUCKET, Key: _key }),
      { expiresIn }
    );
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return `${baseUrl}/api/download/${fileId}`;
}

export function generateStorageKey(
  userId: string | null,
  fileName: string
): string {
  const prefix = userId ?? "anonymous";
  const timestamp = Date.now();
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  return `${prefix}/${timestamp}/${safeName}`;
}

export function isUsingS3(): boolean {
  return USE_S3;
}

export const uploadToS3 = storeFile;
export const getFromS3 = readStoredFile;
export const deleteFromS3 = deleteStoredFile;
export const getSignedDownloadUrl = getDownloadUrl;
