import { randomUUID, createHash } from "crypto";
import sharp from "sharp";
import { getObjectBuffer, putObjectBuffer } from "@/lib/storage";

const THUMBNAIL_MAX_DIMENSION = 640;
const THUMBNAIL_JPEG_QUALITY = 78;

/**
 * Generate a resized JPEG derivative for a photo that has just finished
 * uploading. The original object is never modified (we only ever GET it)
 * and the derivative is written under its own fresh key — "the original
 * file is sacred" holds here too.
 *
 * Returns null (rather than throwing) for anything that isn't a raster
 * image sharp can decode, so callers can treat "no thumbnail" as a normal,
 * expected outcome for documents, videos, notes, etc.
 */
export async function generateThumbnail(params: {
  originalKey: string;
  mimeType: string;
}): Promise<{
  storageKey: string;
  mimeType: string;
  sizeBytes: number;
  checksumSha256: string;
} | null> {
  if (!params.mimeType.startsWith("image/")) {
    return null;
  }

  let thumbnailBuffer: Buffer;
  try {
    const originalBuffer = await getObjectBuffer(params.originalKey);
    thumbnailBuffer = await sharp(originalBuffer)
      .rotate() // respect EXIF orientation
      .resize({
        width: THUMBNAIL_MAX_DIMENSION,
        height: THUMBNAIL_MAX_DIMENSION,
        fit: "inside",
        withoutEnlargement: true,
      })
      .jpeg({ quality: THUMBNAIL_JPEG_QUALITY })
      .toBuffer();
  } catch (err) {
    // Not a decodable image (or a corrupt/unsupported file) - skip silently.
    console.error("Thumbnail generation failed", {
      originalKey: params.originalKey,
      err,
    });
    return null;
  }

  const storageKey = `derivatives/thumbnails/${randomUUID()}.jpg`;
  await putObjectBuffer(storageKey, thumbnailBuffer, "image/jpeg");

  return {
    storageKey,
    mimeType: "image/jpeg",
    sizeBytes: thumbnailBuffer.length,
    checksumSha256: createHash("sha256").update(thumbnailBuffer).digest("hex"),
  };
}
