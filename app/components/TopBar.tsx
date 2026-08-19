"use client";

import { useState, useRef, useEffect } from "react";
import { COLORS, RADIUS, SHADOW } from "./theme";
import { IconSearch, IconPlus } from "./icons";
import NewFolderForm from "../vault/NewFolderForm";
import UploadForm from "../vault/UploadForm";

export default function TopBar({ currentFolderId }: { currentFolderId: string | null }) {
  const [addOpen, setAddOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const addRef = useRef<HTMLDivElement | null>(null);
  const accountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (addRef.current && !addRef.current.contains(e.target as Node)) setAddOpen(false);
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) setAccountOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <header
      style={{
        height: 60,
        borderBottom: `1px solid ${COLORS.border}`,
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: "0 24px",
        position: "sticky",
        top: 0,
        background: COLORS.background,
        zIndex: 10,
      }}
    >
      <form action="/vault" method="GET" style={{ width: "100%", maxWidth: 440 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: COLORS.inputBackground,
            border: `1px solid ${COLORS.border}`,
            borderRadius: RADIUS.md,
            padding: "8px 12px",
          }}
        >
          <IconSearch size={16} />
          <input
            name="search"
            placeholder="Search anything in your life..."
            style={{
              border: "none",
              outline: "none",
              background: "transparent",
              color: COLORS.textPrimary,
              fontSize: 14,
              flex: 1,
            }}
          />
        </div>
      </form>

      <div style={{ flex: 1 }} />

      <div ref={addRef} style={{ position: "relative" }}>
        <button
          type="button"
          onClick={() => setAddOpen((v) => !v)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "9px 16px",
            borderRadius: RADIUS.md,
            border: "none",
            background: COLORS.accent,
            color: "white",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          <IconPlus size={15} />
          Add
        </button>
        {addOpen && (
          <div
            style={{
              position: "absolute",
              right: 0,
              top: "calc(100% + 8px)",
              background: COLORS.surface,
              border: `1px solid ${COLORS.border}`,
              borderRadius: RADIUS.lg,
              padding: 6,
              width: 230,
              boxShadow: SHADOW.menu,
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            <UploadForm
              folderId={currentFolderId}
              variant="menuitem"
              label="Upload Photos"
              accept="image/*"
              onDone={() => setAddOpen(false)}
            />
            <UploadForm
              folderId={currentFolderId}
              variant="menuitem"
              label="Upload File"
              onDone={() => setAddOpen(false)}
            />
            <NewFolderForm parentId={currentFolderId} variant="menuitem" onDone={() => setAddOpen(false)} />
          </div>
        )}
      </div>

      <div ref={accountRef} style={{ position: "relative" }}>
        <button
          type="button"
          onClick={() => setAccountOpen((v) => !v)}
          aria-label="Account menu"
          style={{
            width: 34,
            height: 34,
            borderRadius: "50%",
            border: `1px solid ${COLORS.border}`,
            background: COLORS.surface,
            color: COLORS.textPrimary,
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          BP
        </button>
        {accountOpen && (
          <div
            style={{
              position: "absolute",
              right: 0,
              top: "calc(100% + 8px)",
              background: COLORS.surface,
              border: `1px solid ${COLORS.border}`,
              borderRadius: RADIUS.lg,
              padding: 6,
              width: 180,
              boxShadow: SHADOW.menu,
            }}
          >
            <form action="/api/auth/logout" method="POST">
              <button
                type="submit"
                style={{
                  width: "100%",
                  textAlign: "left",
                  padding: "8px 10px",
                  borderRadius: RADIUS.sm,
                  border: "none",
                  background: "transparent",
                  color: COLORS.textPrimary,
                  fontSize: 14,
                  cursor: "pointer",
                }}
              >
                Sign Out
              </button>
            </form>
          </div>
        )}
      </div>
    </header>
  );
}
