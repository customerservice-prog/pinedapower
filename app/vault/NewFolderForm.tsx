"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewFolderForm({ parentId }: { parentId: string | null }) {
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
      style={{ display: "flex", gap: 8, alignItems: "center", margin: "12px 0" }}
    >
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="New folder name"
        style={{ padding: "6px 10px", border: "1px solid #ccc", borderRadius: 6, fontSize: 14 }}
      />
      <button
        type="submit"
        disabled={busy || !name.trim()}
        style={{
          padding: "6px 12px",
          borderRadius: 6,
          border: "1px solid #ccc",
          background: "none",
          cursor: busy ? "default" : "pointer",
          fontSize: 14,
        }}
      >
        {busy ? "Creating…" : "New folder"}
      </button>
      {error && <span style={{ color: "#c0392b", fontSize: 13 }}>{error}</span>}
    </form>
  );
}
