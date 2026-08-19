"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { COLORS, RADIUS } from "../components/theme";
import { IconFolder } from "../components/icons";
import Dialog from "../components/Dialog";

export default function NewFolderForm({
  parentId,
  variant = "button",
  onDone,
}: {
  parentId: string | null;
  variant?: "button" | "menuitem";
  onDone?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
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
        const body = await res.json().catch(() => null);
        throw new Error(body?.error || "Failed to create folder");
      }
      setName("");
      setOpen(false);
      router.refresh();
      onDone?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create folder");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {variant === "menuitem" ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            width: "100%",
            padding: "8px 10px",
            borderRadius: RADIUS.sm,
            border: "none",
            background: "transparent",
            color: COLORS.textPrimary,
            fontSize: 14,
            cursor: "pointer",
            textAlign: "left",
          }}
        >
          <IconFolder size={16} />
          New Folder
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 14px",
            borderRadius: RADIUS.md,
            border: `1px solid ${COLORS.border}`,
            background: COLORS.surface,
            color: COLORS.textPrimary,
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          <IconFolder size={16} />
          New Folder
        </button>
      )}
      <Dialog open={open} onClose={() => setOpen(false)} title="Create a folder">
        <form onSubmit={handleSubmit}>
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Folder name"
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "10px 12px",
              border: `1px solid ${COLORS.border}`,
              borderRadius: RADIUS.sm,
              fontSize: 14,
              background: COLORS.inputBackground,
              color: COLORS.textPrimary,
              marginBottom: 12,
            }}
          />
          {error && (
            <div style={{ color: COLORS.danger, fontSize: 13, marginBottom: 12 }}>{error}</div>
          )}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <button
              type="button"
              onClick={() => setOpen(false)}
              style={{
                padding: "8px 14px",
                borderRadius: RADIUS.sm,
                border: `1px solid ${COLORS.border}`,
                background: "transparent",
                color: COLORS.textSecondary,
                fontSize: 14,
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy || !name.trim()}
              style={{
                padding: "8px 14px",
                borderRadius: RADIUS.sm,
                border: "none",
                background: busy || !name.trim() ? COLORS.surfaceHover : COLORS.accent,
                color: busy || !name.trim() ? COLORS.textSecondary : "white",
                fontSize: 14,
                fontWeight: 600,
                cursor: busy || !name.trim() ? "default" : "pointer",
              }}
            >
              {busy ? "Creating…" : "Create Folder"}
            </button>
          </div>
        </form>
      </Dialog>
    </>
  );
}
