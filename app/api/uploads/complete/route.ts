import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db";
import { headObject } from "@/lib/storage";
import { generateThumbnail } from "@/lib/thumbnails";

const completeUploadSchema = z.object({
  assetId: z.string().uuid(),
});

// Step 2 of the direct-to-storage upload flow (see /api/uploads/request).
// We never trust the browser's word that an upload succeeded: this route
// asks the bucket itself (via headObject) whether the object actually
// exists, and only then flips the Asset from PENDING to READY.
export async function POST(req: NextRequest) {
  const json = await req.json().catch(() => null);
  const parsed = completeUploadSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const { assetId } = parsed.data;

  const asset = await prisma.asset.findUnique({
    where: { id: assetId },
    include: { item: true },
  });
  if (!asset) {
    return NextResponse.json({ error: "Asset not found" }, { status: 404 });
  }

  const info = await headObject(asset.storageKey);
  if (!info) {
    await prisma.asset.update({
      where: { id: asset.id },
      data: { status: "FAILED" },
    });
    return NextResponse.json(
      { error: "Upload could not be verified in storage" },
      { status: 409 }
    );
  }

  const updated = await prisma.asset.update({
    where: { id: asset.id },
    data: { status: "READY", sizeBytes: info.sizeBytes },
  });

  // Best-effort: generate a thumbnail for photos. A failure here must never
  // block or undo the fact that the original upload itself succeeded.
  if (asset.isOriginal) {
    try {
      const thumbnail = await generateThumbnail({
        originalKey: asset.storageKey,
        mimeType: asset.mimeType,
      });
      if (thumbnail) {
        await prisma.asset.create({
          data: {
            itemId: asset.itemId,
            storageKey: thumbnail.storageKey,
            originalName: `${asset.originalName}.thumb.jpg`,
            mimeType: thumbnail.mimeType,
            sizeBytes: thumbnail.sizeBytes,
            checksumSha256: thumbnail.checksumSha256,
            isOriginal: false,
            status: "READY",
          },
        });
      }
    } catch (err) {
      console.error("Thumbnail pipeline error", { assetId: asset.id, err });
    }
  }

  return NextResponse.json({ asset: updated });
}
