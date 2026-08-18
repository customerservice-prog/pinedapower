import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createDownloadUrl } from "@/lib/storage";

// Redirects to a short-lived presigned download URL for one asset.
// Nothing here is a public URL: this route itself sits behind the
// session-verification middleware, and the signed URL it hands out
// expires quickly. Content-Disposition preserves the original filename
// so downloads and printing show the file as the user named it.
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const asset = await prisma.asset.findUnique({ where: { id: params.id } });
  if (!asset) {
    return NextResponse.json({ error: "Asset not found" }, { status: 404 });
  }
  if (asset.status !== "READY") {
    return NextResponse.json(
      { error: "Asset is not ready for download yet" },
      { status: 409 }
    );
  }

  const url = await createDownloadUrl(asset.storageKey, {
    downloadFilename: asset.originalName,
  });

  return NextResponse.redirect(url);
}
