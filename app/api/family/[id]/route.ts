import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Removes a single family member. Uses a real delete (not soft-delete like
// Items) since family tree entries aren't files with underlying storage to
// preserve. The schema's onDelete: SetNull on parentId1/parentId2/spouseId
// means anyone who referenced this person as a parent or spouse simply has
// that link cleared - their own record and the rest of the tree stay intact.
export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  const existing = await prisma.familyMember.findUnique({ where: { id: params.id } });
  if (!existing) {
    return NextResponse.json({ error: "Family member not found" }, { status: 404 });
  }

  await prisma.familyMember.delete({ where: { id: params.id } });

  return NextResponse.json({ ok: true });
}
