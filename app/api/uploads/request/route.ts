import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { createUploadUrl } from "@/lib/storage";

const ITEM_TYPES = ["PHOTO", "DOCUMENT", "VIDEO", "NOTE", "OTHER"] as const;

// Int32 column in Postgres (see prisma/schema.prisma Asset.sizeBytes).
const MAX_SIZE_BYTES = 2147483647;

const requestUploadSchema = z.object({
  folderId: z.string().uuid().nullable().optional(),
  filename: z.string().trim().min(1).max(500),
  contentType: z.string().trim().min(1).max(255),
  sizeBytes: z.number().int().positive().max(MAX_SIZE_BYTES),
  checksumSha256: z.string().regex(/^[a-f0-9]{64}$/i),
  type: z.enum(ITEM_TYPES).optional(),
});

// Step 1 of the direct-to-storage upload flow:
// 1. Client calls this route with file metadata + a client-computed SHA-256.
// 2. We create the Item + Asset rows (status PENDING) and hand back a
//    short-lived presigned PUT url pointing at a brand-new storage key.
// 3. The browser PUTs the file bytes straight to the bucket (bytes never
//    pass through this server).
// 4. Client calls /api/uploads/complete to confirm and flip status to READY.
// The storage key always embeds a fresh UUID, so "the original file is
// sacred" holds: nothing here can ever collide with or overwrite an
// existing object.
export async function POST(req: NextRequest) {
  const json = await req.json().catch(() => null);
  const parsed = requestUploadSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid upload request" }, { status: 400 });
  }
  const { folderId, filename, contentType, sizeBytes, checksumSha256, type } = parsed.data;

  if (folderId) {
    const folder = await prisma.folder.findUnique({ where: { id: folderId } });
    if (!folder) {
      return NextResponse.json({ error: "Folder not found" }, { status: 404 });
    }
  }

  const storageKey = `originals/${randomUUID()}/${filename}`;

  const { item, asset } = await prisma.$transaction(async (tx) => {
    const item = await tx.item.create({
      data: {
        title: filename,
        type: type ?? "OTHER",
        folderId: folderId ?? null,
      },
    });
    const asset = await tx.asset.create({
      data: {
        itemId: item.id,
        storageKey,
        originalName: filename,
        mimeType: contentType,
        sizeBytes,
        checksumSha256: checksumSha256.toLowerCase(),
        isOriginal: true,
        status: "PENDING",
      },
    });
    return { item, asset };
  });

  const uploadUrl = await createUploadUrl(storageKey, contentType);

  return NextResponse.json({
    itemId: item.id,
    assetId: asset.id,
    uploadUrl,
  });
}
