"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const COLORS = {
    surface: "#16161d",
    border: "#26262f",
    textPrimary: "#f5f5f7",
    textSecondary: "#8a8a93",
    accent: "#5b5bf0",
    success: "#4cd97b",
    danger: "#ff6b6b",
};

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

export default function UploadForm({ folderId }: { folderId: string | null }) {
    const [status, setStatus] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files && e.target.files[0];
        e.target.value = "";
        if (!file) return;
        setError(null);
        try {
            setStatus('Preparing "' + file.name + '"…');
            const checksumSha256 = await sha256Hex(file);

            setStatus('Requesting upload slot for "' + file.name + '"…');
            const reqRes = await fetch("/api/uploads/request", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    folderId,
                    filename: file.name,
                    contentType: file.type || "application/octet-stream",
                    sizeBytes: file.size,
                    checksumSha256,
                    type: inferType(file.type || ""),
                }),
            });
            if (!reqRes.ok) {
                const body = await reqRes.json().catch(() => ({}));
                throw new Error(body.error || "Failed to prepare upload");
            }
            const { uploadUrl, assetId } = await reqRes.json();

            setStatus('Uploading "' + file.name + '"…');
            const putRes = await fetch(uploadUrl, {
                method: "PUT",
                headers: { "Content-Type": file.type || "application/octet-stream" },
                body: file,
            });
            if (!putRes.ok) {
                throw new Error("Upload to storage failed");
            }

            setStatus('Finalizing "' + file.name + '"…');
            const completeRes = await fetch("/api/uploads/complete", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ assetId }),
            });
            if (!completeRes.ok) {
                const body = await completeRes.json().catch(() => ({}));
                throw new Error(body.error || "Failed to finalize upload");
            }

            setStatus('"' + file.name + '" uploaded.');
            router.refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Upload failed");
            setStatus(null);
        }
    }

    return (
        <div style={{ margin: "16px 0", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <label
                style={{
                    display: "inline-block",
                    padding: "8px 14px",
                    border: "1px solid " + COLORS.border,
                    borderRadius: 8,
                    background: COLORS.surface,
                    color: COLORS.textPrimary,
                    cursor: "pointer",
                    fontSize: 14,
                    fontWeight: 600,
                }}
            >
                Upload file
                <input type="file" onChange={handleFile} style={{ display: "none" }} />
            </label>
            {status && <span style={{ fontSize: 13, color: COLORS.textSecondary }}>{status}</span>}
            {error && <span style={{ fontSize: 13, color: COLORS.danger }}>{error}</span>}
        </div>
    );
}
