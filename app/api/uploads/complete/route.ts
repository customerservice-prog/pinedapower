import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { headObject } from "@/lib/storage";

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

  const asset = await prisma.asset.findUnique({ where: { id: assetId } });
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
    data: {
      status: "READY",
      sizeBytes: info.sizeBytes,
    },
  });

  return NextResponse.json({ asset: updated });
}
