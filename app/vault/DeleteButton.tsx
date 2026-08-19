"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { COLORS } from "../components/theme";
import { IconTrash } from "../components/icons";

// Real, working delete - calls DELETE /api/items/[id] (soft delete) and
// refreshes so the item disappears from whichever view it was shown in.
// Confirms first since deletion (even soft) removes it from every list.
export default function DeleteButton({
  itemId,
  itemTitle,
  size = 18,
  onDeleted,
}: {
  itemId: string;
  itemTitle?: string;
  size?: number;
  onDeleted?: () => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  async function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const label = itemTitle ? `"${itemTitle}"` : "this item";
    if (!window.confirm(`Delete ${label}? You won't see it in your Library anymore.`)) return;
    try {
      const res = await fetch(`/api/items/${itemId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Request failed");
      onDeleted?.();
      startTransition(() => router.refresh());
    } catch {
      window.alert("Couldn't delete that. Please try again.");
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      aria-label={itemTitle ? `Delete ${itemTitle}` : "Delete"}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 32,
        height: 32,
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
