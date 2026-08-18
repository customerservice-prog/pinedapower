import Link from "next/link";
import prisma from "@/lib/db";
import NewFolderForm from "./NewFolderForm";
import UploadForm from "./UploadForm";

// Always read fresh from the database - this is a private vault for one
// user, not a page we ever want cached or statically generated.
export const dynamic = "force-dynamic";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB", "TB"];
  let value = bytes / 1024;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex++;
  }
  return `${value.toFixed(1)} ${units[unitIndex]}`;
}

export default async function VaultPage({
  searchParams,
}: {
  searchParams?: { folder?: string };
}) {
  const folderId =
    searchParams?.folder && searchParams.folder.length > 0
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
    <main style={{ fontFamily: "system-ui, sans-serif", padding: "3rem 2rem", maxWidth: 860, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <h1 style={{ marginBottom: 0 }}>My Digital Life</h1>
        <Link href="/" style={{ fontSize: 14 }}>Home</Link>
      </div>
      <div style={{ color: "#666", marginTop: 4 }}>
        <Link href="/vault">Root</Link>
        {currentFolder ? ` / ${currentFolder.name}` : null}
      </div>

      <NewFolderForm parentId={folderId} />

      <section style={{ marginTop: 32 }}>
        <h2 style={{ fontSize: 16, color: "#333" }}>Folders</h2>
        {subfolders.length === 0 ? (
          <p style={{ color: "#888", fontSize: 14 }}>No folders yet.</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, display: "flex", flexWrap: "wrap", gap: 8 }}>
            {subfolders.map((folder) => (
              <li key={folder.id}>
                <Link
                  href={`/vault?folder=${folder.id}`}
                  style={{ display: "inline-block", padding: "8px 14px", border: "1px solid #ddd", borderRadius: 8, textDecoration: "none", color: "#222" }}
                >
                  {folder.name}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section style={{ marginTop: 32 }}>
        <h2 style={{ fontSize: 16, color: "#333" }}>Files</h2>
        <UploadForm folderId={folderId} />
        {items.length === 0 ? (
          <p style={{ color: "#888", fontSize: 14 }}>No files in this folder yet.</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {items.map((item) => {
              const asset = item.assets.find((a) => a.isOriginal) ?? item.assets[0];
              const thumbnail = item.assets.find(
                (a) => !a.isOriginal && a.status === "READY"
              );
              return (
                <li
                  key={item.id}
                  style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #eee" }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    {thumbnail ? (
                      <img
                        src={`/api/items/${item.id}/thumbnail`}
                        alt=""
                        width={48}
                        height={48}
                        style={{ objectFit: "cover", borderRadius: 6, border: "1px solid #eee" }}
                      />
                    ) : (
                      <div
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: 6,
                          border: "1px solid #eee",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 11,
                          color: "#999",
                        }}
                      >
                        {item.type}
                      </div>
                    )}
                    <div>
                      <div>{item.title}</div>
                      <div style={{ fontSize: 12, color: "#888" }}>
                        {asset
                          ? `${asset.mimeType} · ${formatBytes(asset.sizeBytes)} · ${asset.status}`
                          : "no file"}
                      </div>
                    </div>
                  </div>
                  <div>
                    {asset && asset.status === "READY" ? (
                      <a href={`/api/assets/${asset.id}/download`} style={{ fontSize: 14 }}>
                        Download
                      </a>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </main>
  );
}
