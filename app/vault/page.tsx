// Vault page: renders folders and files with real file-type icons.
import Link from "next/link";
import { prisma } from "@/lib/db";
import NewFolderForm from "./NewFolderForm";
import UploadForm from "./UploadForm";
import FileIcon from "./FileIcon";
import { getFileKind, FILE_KIND_LABELS } from "@/lib/fileKind";

// Always read fresh from the database - this is a private vault for one
// user, not a page we ever want cached or statically generated.
export const dynamic = "force-dynamic";

const COLORS = {
    background: "#0b0b0f",
    surface: "#16161d",
    border: "#26262f",
    textPrimary: "#f5f5f7",
    textSecondary: "#8a8a93",
    accent: "#5b5bf0",
};

function formatBytes(bytes) {
    if (bytes < 1024) return bytes + " B";
    const units = ["KB", "MB", "GB", "TB"];
    let value = bytes / 1024;
    let unitIndex = 0;
    while (value >= 1024 && unitIndex < units.length - 1) {
        value /= 1024;
        unitIndex++;
    }
    return value.toFixed(1) + " " + units[unitIndex];
}

export default async function VaultPage({
    searchParams,
}: {
    searchParams?: { folder?: string };
}) {
    const folderId =
        searchParams && searchParams.folder && searchParams.folder.length > 0
            ? searchParams.folder
            : null;

    const currentFolder = folderId
        ? await prisma.folder.findUnique({ where: { id: folderId } })
        : null;

    const [subfolders, items] = await Promise.all([
        prisma.folder.findMany({
            where: { parentId: folderId },
            orderBy: { name: "asc" },
        }),
        prisma.item.findMany({
            where: { folderId, deletedAt: null },
            include: { assets: true },
            orderBy: { createdAt: "desc" },
            take: 100,
        }),
    ]);

    return (
        <main
            style={{
                minHeight: "100vh",
                background: COLORS.background,
                color: COLORS.textPrimary,
                fontFamily:
                    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                padding: "3rem 2rem",
                maxWidth: 900,
                margin: "0 auto",
                boxSizing: "border-box",
            }}
        >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <h1 style={{ marginBottom: 0, fontSize: 22, fontWeight: 600 }}>My Digital Life</h1>
                <Link href="/" style={{ fontSize: 14, color: COLORS.accent, textDecoration: "none" }}>Home</Link>
            </div>
            <div style={{ color: COLORS.textSecondary, marginTop: 6, fontSize: 14 }}>
                <Link href="/vault" style={{ color: COLORS.accent, textDecoration: "none" }}>Root</Link>
                {currentFolder ? " / " + currentFolder.name : null}
            </div>

            <NewFolderForm parentId={folderId} />

            <section style={{ marginTop: 32 }}>
                <h2 style={{ fontSize: 13, color: COLORS.textSecondary, textTransform: "uppercase", letterSpacing: 0.6, fontWeight: 600, marginBottom: 12 }}>Folders</h2>
                {subfolders.length === 0 ? (
                    <p style={{ color: COLORS.textSecondary, fontSize: 14 }}>No folders yet.</p>
                ) : (
                    <ul style={{ listStyle: "none", padding: 0, display: "flex", flexWrap: "wrap", gap: 8, margin: 0 }}>
                        {subfolders.map((folder) => (
                            <li key={folder.id}>
                                <Link
                                    href={"/vault?folder=" + folder.id}
                                    style={{ display: "inline-block", padding: "8px 14px", border: "1px solid " + COLORS.border, borderRadius: 8, textDecoration: "none", color: COLORS.textPrimary, background: COLORS.surface, fontSize: 14 }}
                                >
                                    {folder.name}
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            <section style={{ marginTop: 32 }}>
                <h2 style={{ fontSize: 13, color: COLORS.textSecondary, textTransform: "uppercase", letterSpacing: 0.6, fontWeight: 600, marginBottom: 12 }}>Files</h2>
                <UploadForm folderId={folderId} />
                {items.length === 0 ? (
                    <p style={{ color: COLORS.textSecondary, fontSize: 14 }}>No files in this folder yet.</p>
                ) : (
                    <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                        {items.map((item) => {
                            const asset = item.assets.find((a) => a.isOriginal) || item.assets[0];
                            const thumbnail = item.assets.find((a) => !a.isOriginal && a.status === "READY");
                            const kind = getFileKind(asset && asset.mimeType, asset && asset.originalName);
                            return (
                                <li key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid " + COLORS.border }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                        {thumbnail ? (
                                            <img
                                                src={"/api/items/" + item.id + "/thumbnail"}
                                                alt=""
                                                style={{ width: 48, height: 48, objectFit: "cover", borderRadius: 6, border: "1px solid " + COLORS.border }}
                                            />
                                        ) : (
                                            <FileIcon kind={kind} />
                                        )}
                                        <div>
                                            <div style={{ fontSize: 14 }}>{item.title}</div>
                                            <div style={{ fontSize: 12, color: COLORS.textSecondary }}>
                                                {asset ? FILE_KIND_LABELS[kind] + " \u00b7 " + formatBytes(asset.sizeBytes) + " \u00b7 " + asset.status : "no file"}
                                            </div>
                                        </div>
                                    </div>
                                    {asset && asset.status === "READY" ? (
                                        <a href={"/api/assets/" + asset.id + "/download"} style={{ fontSize: 14, color: COLORS.accent, textDecoration: "none" }}>Download</a>
                                    ) : null}
                                </li>
                            );
                        })}
                    </ul>
                )}
            </section>
        </main>
    );
}
