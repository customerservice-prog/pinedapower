import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

/**
 * Low-level private object storage client.
 * This wraps an S3-compatible bucket (provisioned as a Railway "Bucket"
 * service) behind a small set of primitives: presigned upload URLs,
 * presigned download URLs, delete, and existence/metadata checks.
 *
 * IMPORTANT — "THE ORIGINAL FILE IS SACRED":
 * Nothing in this module ever overwrites an existing object key in place.
 * Higher-level code (added in a later phase) is responsible for choosing
 * unique, content-addressed or UUID-based keys for original files, and for
 * storing derivatives (thumbnails, previews) under separate keys.
 *
 * All access to this bucket is private. There are no public URLs — every
 * read or write happens through a short-lived signed URL generated here.
 */

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}. Object storage is not configured.`);
  }
  return value;
}

let cachedClient: S3Client | null = null;

function getClient(): S3Client {
  if (cachedClient) return cachedClient;
  cachedClient = new S3Client({
    endpoint: requiredEnv("STORAGE_ENDPOINT"),
    region: process.env.STORAGE_REGION || "auto",
    credentials: {
      accessKeyId: requiredEnv("STORAGE_ACCESS_KEY_ID"),
      secretAccessKey: requiredEnv("STORAGE_SECRET_ACCESS_KEY"),
    },
    // Most S3-compatible providers (and Railway's bucket service) require
    // path-style addressing rather than virtual-hosted-style.
    forcePathStyle: true,
  });
  return cachedClient;
}

function getBucket(): string {
  return requiredEnv("STORAGE_BUCKET");
}

const DEFAULT_EXPIRES_SECONDS = 15 * 60; // 15 minutes

/**
 * Create a short-lived presigned URL the browser can PUT a file's bytes to
 * directly, without the file ever passing through our Next.js server.
 */
export async function createUploadUrl(
  key: string,
  contentType: string,
  expiresInSeconds: number = DEFAULT_EXPIRES_SECONDS
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: getBucket(),
    Key: key,
    ContentType: contentType,
  });
  return getSignedUrl(getClient(), command, { expiresIn: expiresInSeconds });
}

/**
 * Create a short-lived presigned URL for downloading/viewing/printing an
 * object. Optionally forces a specific filename via Content-Disposition so
 * downloads preserve the original file name.
 */
export async function createDownloadUrl(
  key: string,
  options?: { expiresInSeconds?: number; downloadFilename?: string }
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: getBucket(),
    Key: key,
    ResponseContentDisposition: options?.downloadFilename
      ? `attachment; filename="${options.downloadFilename.replace(/"/g, "")}"`
      : undefined,
  });
  return getSignedUrl(getClient(), command, {
    expiresIn: options?.expiresInSeconds ?? DEFAULT_EXPIRES_SECONDS,
  });
}

/**
 * Permanently delete an object. This is only ever used for real deletions
 * (e.g. emptying trash after the retention window), never for routine
 * "remove from view" actions, which should be soft deletes at the database
 * level instead.
 */
export async function deleteObject(key: string): Promise<void> {
  await getClient().send(
    new DeleteObjectCommand({ Bucket: getBucket(), Key: key })
  );
}

/**
 * Check whether an object exists and, if so, return its size and etag.
 * Returns null if the object does not exist.
 */
export async function headObject(
  key: string
): Promise<{ sizeBytes: number; etag?: string } | null> {
  try {
    const result = await getClient().send(
      new HeadObjectCommand({ Bucket: getBucket(), Key: key })
    );
    return { sizeBytes: result.ContentLength ?? 0, etag: result.ETag };
  } catch (err: unknown) {
    const maybeCode = (err as { name?: string })?.name;
    if (maybeCode === "NotFound") {
      return null;
    }
    throw err;
  }
}

/**
 * Fetch an object's full contents into memory. Only used server-side for
 * small-to-medium derivative generation (e.g. thumbnailing a photo just
 * uploaded) — never for streaming large originals through the app server.
 */
export async function getObjectBuffer(key: string): Promise<Buffer> {
  const result = await getClient().send(
    new GetObjectCommand({ Bucket: getBucket(), Key: key })
  );
  const stream = result.Body as unknown as AsyncIterable<Uint8Array>;
  const chunks: Uint8Array[] = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

/**
 * Upload a small server-generated derivative (e.g. a thumbnail) directly,
 * bypassing the presigned-URL browser flow used for user-supplied originals.
 */
export async function putObjectBuffer(
  key: string,
  body: Buffer,
  contentType: string
): Promise<void> {
  await getClient().send(
    new PutObjectCommand({
      Bucket: getBucket(),
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  );
}
