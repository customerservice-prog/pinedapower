import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { createDownloadUrl } from "@/lib/storage";

// Redirects to a short-lived signed URL for an item's generated thumbnail,
// if one exists. Thumbnails are private derivatives, never public files -
// every view goes through a fresh signed URL, same as originals.
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const thumbnail = await prisma.asset.findFirst({
    where: { itemId: params.id, isOriginal: false, status: "READY" },
    orderBy: { createdAt: "desc" },
  });

  if (!thumbnail) {
    return NextResponse.json(
      { error: "No thumbnail available" },
      { status: 404 }
    );
  }

  const url = await createDownloadUrl(thumbnail.storageKey, {
    expiresInSeconds: 3600,
  });
  return NextResponse.redirect(url);
}
