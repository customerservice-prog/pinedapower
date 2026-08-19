import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Soft-deletes a single item (sets deletedAt). Every list query in the
// app already filters on deletedAt: null, so this immediately removes
// the item from the Library, Favorites, and type-filtered views without
// touching the underlying assets/storage.
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    const existing = await prisma.item.findUnique({ where: { id: params.id } });
    if (!existing || existing.deletedAt) {
          return NextResponse.json({ error: "Item not found" }, { status: 404 });
        }

    const item = await prisma.item.update({
          where: { id: params.id },
          data: { deletedAt: new Date() },
        });

    return NextResponse.json({ item });
  }
