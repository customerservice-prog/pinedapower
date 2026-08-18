import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

// Folders are a simple self-referential tree (see prisma/schema.prisma).
// A null parentId means "root level". This route intentionally stays thin:
// validation via zod, a couple of existence checks, then a direct prisma call.
const createFolderSchema = z.object({
  name: z.string().trim().min(1).max(255),
  parentId: z.string().uuid().nullable().optional(),
});

export async function GET(req: NextRequest) {
  const parentId = req.nextUrl.searchParams.get("parentId");
  const folders = await prisma.folder.findMany({
    where: { parentId: parentId && parentId.length > 0 ? parentId : null },
    orderBy: { name: "asc" },
  });
  return NextResponse.json({ folders });
}

export async function POST(req: NextRequest) {
  const json = await req.json().catch(() => null);
  const parsed = createFolderSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid folder data" }, { status: 400 });
  }
  const { name, parentId } = parsed.data;

  if (parentId) {
    const parent = await prisma.folder.findUnique({ where: { id: parentId } });
    if (!parent) {
      return NextResponse.json({ error: "Parent folder not found" }, { status: 404 });
    }
  }

  const folder = await prisma.folder.create({
    data: { name, parentId: parentId ?? null },
  });
  return NextResponse.json({ folder }, { status: 201 });
}
