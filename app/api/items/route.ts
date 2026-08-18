import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Lists items in a folder (or root, when folderId is omitted), newest
// first, excluding soft-deleted items. Cursor-based pagination keeps this
// cheap even once a folder holds thousands of items.
const PAGE_SIZE = 100;

export async function GET(req: NextRequest) {
  const folderId = req.nextUrl.searchParams.get("folderId");
  const cursor = req.nextUrl.searchParams.get("cursor");

  const items = await prisma.item.findMany({
    where: {
      folderId: folderId && folderId.length > 0 ? folderId : null,
      deletedAt: null,
    },
    include: { assets: true },
    orderBy: { createdAt: "desc" },
    take: PAGE_SIZE + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  });

  const hasMore = items.length > PAGE_SIZE;
  const page = hasMore ? items.slice(0, PAGE_SIZE) : items;

  return NextResponse.json({
    items: page,
    nextCursor: hasMore ? page[page.length - 1].id : null,
  });
}
