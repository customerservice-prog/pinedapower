import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Family Tree: list every person, and create new ones. Kept intentionally
// simple (no auth check here beyond the global middleware, same as the
// items API) since this is a private single-user vault.
export async function GET() {
  const members = await prisma.familyMember.findMany({
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json({ members });
}

function toIntOrNull(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const n = typeof value === "number" ? value : parseInt(String(value), 10);
  return Number.isFinite(n) ? n : null;
}

function toIdOrNull(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

const VALID_GENDERS = ["MALE", "FEMALE", "OTHER", "UNKNOWN"];

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const member = await prisma.familyMember.create({
    data: {
      name,
      gender: VALID_GENDERS.includes(body?.gender) ? body.gender : "UNKNOWN",
      birthYear: toIntOrNull(body?.birthYear),
      deathYear: toIntOrNull(body?.deathYear),
      notes: typeof body?.notes === "string" && body.notes.trim() ? body.notes.trim() : null,
      parentId1: toIdOrNull(body?.parentId1),
      parentId2: toIdOrNull(body?.parentId2),
      spouseId: toIdOrNull(body?.spouseId),
    },
  });

  return NextResponse.json({ member });
}
