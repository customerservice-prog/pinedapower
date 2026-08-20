"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { COLORS } from "../components/theme";
import { IconTrash } from "../components/icons";

// Removes a person from the family tree. Calls DELETE /api/family/[id];
// the schema clears any parentId1/parentId2/spouseId fields on other
// members that pointed at this person, so the rest of the tree survives.
export default function FamilyDeleteButton({
  memberId,
  memberName,
  size = 16,
}: {
  memberId: string;
  memberName?: string;
  size?: number;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  async function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const label = memberName ? `"${memberName}"` : "this person";
    if (!window.confirm(`Remove ${label} from the family tree?`)) return;
    try {
      const res = await fetch(`/api/family/${memberId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Request failed");
      startTransition(() => router.refresh());
    } catch {
      window.alert("Couldn't remove that person. Please try again.");
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      aria-label={memberName ? `Remove ${memberName}` : "Remove"}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 26,
        height: 26,
        borderRadius: 8,
        border: "none",
        background: "transparent",
        color: COLORS.textTertiary,
        cursor: isPending ? "default" : "pointer",
        opacity: isPending ? 0.5 : 1,
      }}
    >
      <IconTrash size={size} />
    </button>
  );
}
