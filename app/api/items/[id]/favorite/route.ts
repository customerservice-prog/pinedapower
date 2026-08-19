import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

// Toggles the favorite flag on a single item. A real, working feature -
// items marked favorite show up in the Favorites view on the Library page.
const favoriteSchema = z.object({
favorite: z.boolean(),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
const json = await req.json().catch(() => null);
const parsed = favoriteSchema.safeParse(json);
if (!parsed.success) {
return NextResponse.json({ error: "Invalid request" }, { status: 400 });
}

const existing = await prisma.item.findUnique({ where: { id: params.id } });
if (!existing) {
return NextResponse.json({ error: "Item not found" }, { status: 404 });
}

const item = await prisma.item.update({
where: { id: params.id },
data: { favorite: parsed.data.favorite },
});

return NextResponse.json({ item });
}
