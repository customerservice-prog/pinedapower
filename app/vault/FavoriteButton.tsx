"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { COLORS } from "../components/theme";
import { IconStar } from "../components/icons";

// Real, working favorite toggle - calls the PATCH /api/items/[id]/favorite
// route and refreshes the page so the Favorites view stays in sync.
export default function FavoriteButton({
itemId,
initialFavorite,
}: {
itemId: string;
initialFavorite: boolean;
}) {
const router = useRouter();
const [favorite, setFavorite] = useState(initialFavorite);
const [isPending, startTransition] = useTransition();

async function toggle() {
const next = !favorite;
setFavorite(next);
try {
const res = await fetch(`/api/items/${itemId}/favorite`, {
method: "PATCH",
headers: { "Content-Type": "application/json" },
body: JSON.stringify({ favorite: next }),
});
if (!res.ok) throw new Error("Request failed");
startTransition(() => router.refresh());
} catch {
setFavorite(!next);
}
}

return (
<button
type="button"
onClick={toggle}
disabled={isPending}
aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
aria-pressed={favorite}
style={{
display: "flex",
alignItems: "center",
justifyContent: "center",
width: 32,
height: 32,
borderRadius: 8,
border: "none",
background: "transparent",
color: favorite ? "#f5b544" : COLORS.textTertiary,
cursor: "pointer",
}}
>
<IconStar size={18} filled={favorite} />
</button>
);
}
