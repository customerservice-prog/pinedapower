"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const COLORS = {
    surface: "#16161d",
    border: "#26262f",
    inputBackground: "#0f0f14",
    textPrimary: "#f5f5f7",
    textSecondary: "#8a8a93",
    accent: "#5b5bf0",
    danger: "#ff6b6b",
};

export default function NewFolderForm({ parentId }) {
    const [name, setName] = useState("");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState(null);
    const router = useRouter();

    async function handleSubmit(e) {
        e.preventDefault();
        if (!name.trim()) return;
        setBusy(true);
        setError(null);
        try {
            const res = await fetch("/api/folders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: name.trim(), parentId }),
            });
            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                throw new Error(body.error || "Failed to create folder");
            }
            setName("");
            router.refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to create folder");
        } finally {
            setBusy(false);
        }
    }

    return (
        <form
            onSubmit={handleSubmit}
            style={{ display: "flex", gap: 8, alignItems: "center", margin: "20px 0" }}
        >
            <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="New folder name"
                style={{
                    padding: "8px 12px",
                    border: "1px solid " + COLORS.border,
                    borderRadius: 8,
                    fontSize: 14,
                    background: COLORS.inputBackground,
                    color: COLORS.textPrimary,
                }}
            />
            <button
                type="submit"
                disabled={busy || !name.trim()}
                style={{
                    padding: "8px 14px",
                    borderRadius: 8,
                    border: "1px solid " + COLORS.border,
                    background: busy || !name.trim() ? COLORS.surface : COLORS.accent,
                    color: busy || !name.trim() ? COLORS.textSecondary : "white",
                    cursor: busy ? "default" : "pointer",
                    fontSize: 14,
                    fontWeight: 600,
                }}
            >
                {busy ? "Creating…" : "New folder"}
            </button>
            {error && <span style={{ color: COLORS.danger, fontSize: 13 }}>{error}</span>}
        </form>
    );
}
