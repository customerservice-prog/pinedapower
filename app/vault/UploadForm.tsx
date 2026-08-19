"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { COLORS, RADIUS } from "../components/theme";
import { IconUpload } from "../components/icons";

// Direct-to-storage upload flow (see app/api/uploads/request and
// app/api/uploads/complete). File bytes go straight from this browser to
// the private bucket via a presigned URL; they never pass through our
// Next.js server. A client-computed SHA-256 travels with the request so
// later phases can use it for duplicate detection.
async function sha256Hex(file: File): Promise<string> {
  const buf = await file.arrayBuffer();
  const hashBuf = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(hashBuf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function inferType(mime: string): "PHOTO" | "DOCUMENT" | "VIDEO" | "OTHER" {
  if (mime.startsWith("image/")) return "PHOTO";
  if (mime.startsWith("video/")) return "VIDEO";
  if (mime === "application/pdf" || mime.startsWith("text/")) return "DOCUMENT";
  return "OTHER";
}

export default function UploadForm({
  folderId,
  variant = "button",
  label = "Upload File",
  accept,
  onDone,
}: {
  folderId: string | null;
  variant?: "button" | "menuitem" | "dropzone";
  label?: string;
  accept?: string;
  onDone?: () => void;
}) {
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();

  async function uploadOne(file: File) {
    setError(null);
    try {
      setStatus(`Preparing "${file.name}"…`);
      const checksumSha256 = await sha256Hex(file);

      setStatus(`Requesting upload slot for "${file.name}"…`);
      const reqRes = await fetch("/api/uploads/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          folderId,
          filename: file.name,
          contentType: file.type || "application/octet-stream",
          sizeBytes: file.size,
          checksumSha256,
          type: inferType(file.type),
        }),
      });
      if (!reqRes.ok) {
        const body = await reqRes.json().catch(() => null);
        throw new Error(body?.error || "Failed to prepare upload");
      }
      const { uploadUrl, assetId } = await reqRes.json();

      setStatus(`Uploading "${file.name}"…`);
      const putRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type || "application/octet-stream" },
        body: file,
      });
      if (!putRes.ok) throw new Error("Upload to storage failed");

      setStatus(`Finalizing "${file.name}"…`);
      const completeRes = await fetch("/api/uploads/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assetId }),
      });
      if (!completeRes.ok) {
        const body = await completeRes.json().catch(() => null);
        throw new Error(body?.error || "Failed to finalize upload");
      }

      setStatus(`"${file.name}" uploaded.`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setStatus(null);
    }
  }

  async function uploadFiles(files: FileList | File[]) {
    for (const file of Array.from(files)) {
      await uploadOne(file);
    }
    onDone?.();
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    e.target.value = "";
    if (!files || files.length === 0) return;
    await uploadFiles(files);
  }

  const hiddenInput = (
    <input
      ref={inputRef}
      type="file"
      accept={accept}
      multiple
      onChange={handleFile}
      style={{ display: "none" }}
    />
  );

  if (variant === "menuitem") {
    return (
      <>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
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
          <IconUpload size={16} />
          {label}
        </button>
        {hiddenInput}
        {status && <span style={{ fontSize: 13, color: COLORS.textSecondary }}>{status}</span>}
        {error && <span style={{ fontSize: 13, color: COLORS.danger }}>{error}</span>}
      </>
    );
  }

  if (variant === "dropzone") {
    return (
      <div>
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
              uploadFiles(e.dataTransfer.files);
            }
          }}
          style={{
            border: `1.5px dashed ${dragOver ? COLORS.accent : COLORS.border}`,
            borderRadius: RADIUS.lg,
            padding: "48px 24px",
            textAlign: "center",
            background: dragOver ? COLORS.surfaceHover : COLORS.surface,
          }}
        >
          <div
            style={{
              color: COLORS.textSecondary,
              marginBottom: 10,
              display: "flex",
              justifyContent: "center",
            }}
          >
            <IconUpload size={28} />
          </div>
          <div style={{ color: COLORS.textPrimary, fontSize: 15, fontWeight: 600, marginBottom: 4 }}>
            Drop anything from your life here
          </div>
          <div style={{ color: COLORS.textSecondary, fontSize: 13, marginBottom: 16 }}>
            Photos, documents, PDFs and more
          </div>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            style={{
              padding: "8px 16px",
              borderRadius: RADIUS.md,
              border: `1px solid ${COLORS.border}`,
              background: COLORS.background,
              color: COLORS.textPrimary,
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Browse Files
          </button>
        </div>
        {hiddenInput}
        {status && (
          <div style={{ fontSize: 13, color: COLORS.textSecondary, marginTop: 10 }}>{status}</div>
        )}
        {error && <div style={{ fontSize: 13, color: COLORS.danger, marginTop: 10 }}>{error}</div>}
      </div>
    );
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
      <label
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "8px 14px",
          border: `1px solid ${COLORS.border}`,
          borderRadius: RADIUS.md,
          background: COLORS.surface,
          color: COLORS.textPrimary,
          cursor: "pointer",
          fontSize: 14,
          fontWeight: 600,
        }}
      >
        <IconUpload size={16} />
        {label}
        <input type="file" accept={accept} multiple onChange={handleFile} style={{ display: "none" }} />
      </label>
      {status && <span style={{ fontSize: 13, color: COLORS.textSecondary }}>{status}</span>}
      {error && <span style={{ fontSize: 13, color: COLORS.danger }}>{error}</span>}
    </div>
  );
}
