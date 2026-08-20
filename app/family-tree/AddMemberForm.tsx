"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { COLORS, RADIUS } from "../components/theme";
import { IconPlus } from "../components/icons";
import Dialog from "../components/Dialog";

type MemberOption = { id: string; name: string };

// Adds a person to the family tree, optionally linking them to up to two
// existing parents and one spouse. Real relationships, not placeholders -
// selecting a parent/spouse here is what draws the branch lines on the tree.
export default function AddMemberForm({ members }: { members: MemberOption[] }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [gender, setGender] = useState("UNKNOWN");
  const [birthYear, setBirthYear] = useState("");
  const [deathYear, setDeathYear] = useState("");
  const [notes, setNotes] = useState("");
  const [parentId1, setParentId1] = useState("");
  const [parentId2, setParentId2] = useState("");
  const [spouseId, setSpouseId] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function reset() {
    setName("");
    setGender("UNKNOWN");
    setBirthYear("");
    setDeathYear("");
    setNotes("");
    setParentId1("");
    setParentId2("");
    setSpouseId("");
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/family", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          gender,
          birthYear: birthYear ? Number(birthYear) : null,
          deathYear: deathYear ? Number(deathYear) : null,
          notes: notes.trim() || null,
          parentId1: parentId1 || null,
          parentId2: parentId2 || null,
          spouseId: spouseId || null,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error || "Failed to add family member");
      }
      reset();
      setOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add family member");
    } finally {
      setBusy(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    boxSizing: "border-box",
    padding: "9px 11px",
    border: `1px solid ${COLORS.border}`,
    borderRadius: RADIUS.sm,
    fontSize: 14,
    background: COLORS.inputBackground,
    color: COLORS.textPrimary,
    marginBottom: 12,
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 12,
    fontWeight: 600,
    color: COLORS.textSecondary,
    marginBottom: 6,
    display: "block",
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "8px 14px",
          borderRadius: RADIUS.md,
          border: "none",
          background: COLORS.accent,
          color: "#fff",
          fontSize: 14,
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        <IconPlus size={16} />
        Add Family Member
      </button>
      <Dialog open={open} onClose={() => setOpen(false)} title="Add a family member">
        <form onSubmit={handleSubmit}>
          <label style={labelStyle}>Name</label>
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full name"
            style={inputStyle}
          />

          <label style={labelStyle}>Gender</label>
          <select value={gender} onChange={(e) => setGender(e.target.value)} style={inputStyle}>
            <option value="UNKNOWN">Unspecified</option>
            <option value="FEMALE">Female</option>
            <option value="MALE">Male</option>
            <option value="OTHER">Other</option>
          </select>

          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Birth year</label>
              <input
                value={birthYear}
                onChange={(e) => setBirthYear(e.target.value.replace(/[^0-9]/g, ""))}
                placeholder="e.g. 1950"
                style={inputStyle}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Death year</label>
              <input
                value={deathYear}
                onChange={(e) => setDeathYear(e.target.value.replace(/[^0-9]/g, ""))}
                placeholder="optional"
                style={inputStyle}
              />
            </div>
          </div>

          <label style={labelStyle}>Parent 1</label>
          <select
            value={parentId1}
            onChange={(e) => setParentId1(e.target.value)}
            style={inputStyle}
          >
            <option value="">— None —</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>

          <label style={labelStyle}>Parent 2</label>
          <select
            value={parentId2}
            onChange={(e) => setParentId2(e.target.value)}
            style={inputStyle}
          >
            <option value="">— None —</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>

          <label style={labelStyle}>Spouse / Partner</label>
          <select
            value={spouseId}
            onChange={(e) => setSpouseId(e.target.value)}
            style={inputStyle}
          >
            <option value="">— None —</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>

          <label style={labelStyle}>Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Anything you want to remember..."
            rows={3}
            style={{ ...inputStyle, resize: "vertical" }}
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
              {busy ? "Adding…" : "Add Member"}
            </button>
          </div>
        </form>
      </Dialog>
    </>
  );
}
