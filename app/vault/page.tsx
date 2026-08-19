// Library page: renders folders and files with real file-type icons,
// wrapped in the shared application shell.
import Link from "next/link";
import prisma from "@/lib/db";
import NewFolderForm from "./NewFolderForm";
import UploadForm from "./UploadForm";
import FileIcon from "./FileIcon";
import { getFileKind, FILE_KIND_LABELS } from "@/lib/fileKind";
import AppShell from "../components/AppShell";
import Breadcrumbs from "../components/Breadcrumbs";
import EmptyState from "../components/EmptyState";
import { COLORS, RADIUS } from "../components/theme";
import { IconFolder, IconDocument } from "../components/icons";

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

async function getAncestors(folderId: string | null) {
  const chain: { id: string; name: string }[] = [];
  let currentId = folderId;
  while (currentId) {
    const folder: any = await prisma.folder.findUnique({
      where: { id: currentId },
      select: { id: true, name: true, parentId: true },
    });
    if (!folder) break;
    chain.unshift({ id: folder.id, name: folder.name });
    currentId = folder.parentId;
  }
  return chain;
}

export default async function VaultPage({
  searchParams,
}: {
  searchParams?: { folder?: string; search?: string };
}) {
  const folderId =
    searchParams?.folder && searchParams.folder.length > 0 ? searchParams.folder : null;
  const search = searchParams?.search?.trim() || "";

  if (search) {
    const results: any[] = await prisma.item.findMany({
      where: {
        deletedAt: null,
        title: { contains: search, mode: "insensitive" },
      },
      include: { assets: true },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return (
      <AppShell active="library" currentFolderId={null}>
        <div style={{ maxWidth: 1000, margin: "0 auto", padding: "32px 32px 64px" }}>
          <Breadcrumbs
            items={[{ label: "Library", href: "/vault" }, { label: `Search: "${search}"` }]}
          />
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: "16px 0 24px" }}>
            Search results for &ldquo;{search}&rdquo;
          </h1>
          {results.length === 0 ? (
            <EmptyState
              icon={<IconDocument size={40} />}
              title="No matches found"
              description="Try a different search term, or browse your Library directly."
            />
          ) : (
            <ItemList items={results} />
          )}
        </div>
      </AppShell>
    );
  }

  const [currentFolder, ancestors, subfolders, items]: any = await Promise.all([
    folderId ? prisma.folder.findUnique({ where: { id: folderId } }) : null,
    getAncestors(folderId),
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

  const crumbs = [
    { label: "Library", href: folderId ? "/vault" : undefined },
    ...ancestors.map((a: any, i: number) => ({
      label: a.name,
      href: i < ancestors.length - 1 ? `/vault?folder=${a.id}` : undefined,
    })),
  ];

  const isEmpty = subfolders.length === 0 && items.length === 0;

  return (
    <AppShell active="library" currentFolderId={folderId}>
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "32px 32px 64px" }}>
        <Breadcrumbs items={crumbs} />

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            margin: "16px 0 28px",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>
            {currentFolder ? currentFolder.name : "Library"}
          </h1>
          <div style={{ display: "flex", gap: 10 }}>
            <NewFolderForm parentId={folderId} />
            <UploadForm folderId={folderId} label="Upload File" />
          </div>
        </div>

        {isEmpty && (
          <>
            <EmptyState
              icon={<IconFolder size={40} />}
              title="Your library is empty"
              description="Photos, documents and everything else you preserve will appear here."
            />
            <UploadForm folderId={folderId} variant="dropzone" />
          </>
        )}

        {subfolders.length > 0 && (
          <section style={{ marginTop: isEmpty ? 0 : 8 }}>
            <SectionLabel>Folders</SectionLabel>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 32 }}>
              {subfolders.map((folder: any) => (
                <Link
                  key={folder.id}
                  href={`/vault?folder=${folder.id}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "14px 18px",
                    minWidth: 160,
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: RADIUS.lg,
                    textDecoration: "none",
                    color: COLORS.textPrimary,
                    background: COLORS.surface,
                    fontSize: 14,
                    fontWeight: 600,
                  }}
                >
                  <IconFolder size={20} />
                  {folder.name}
                </Link>
              ))}
            </div>
          </section>
        )}

        {items.length > 0 && (
          <section>
            <SectionLabel>Files</SectionLabel>
            <ItemList items={items} />
          </section>
        )}
      </div>
    </AppShell>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: 12,
        color: COLORS.textSecondary,
        textTransform: "uppercase",
        letterSpacing: 0.6,
        fontWeight: 600,
        marginBottom: 12,
      }}
    >
      {children}
    </div>
  );
}

function ItemList({ items }: { items: any[] }) {
  return (
    <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
      {items.map((item: any) => {
        const asset = item.assets.find((a: any) => a.isOriginal);
        const thumbnail = item.assets.find((a: any) => a.isOriginal && a.status === "READY");
        const kind = getFileKind(asset?.mimeType, asset?.originalName);
        return (
          <li
            key={item.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "12px 14px",
              borderRadius: RADIUS.md,
              border: `1px solid ${COLORS.border}`,
              background: COLORS.surface,
              marginBottom: 8,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {thumbnail ? (
                <img
                  src={`/api/items/${item.id}/thumbnail`}
                  alt=""
                  style={{
                    width: 40,
                    height: 40,
                    objectFit: "cover",
                    borderRadius: 8,
                    border: `1px solid ${COLORS.border}`,
                  }}
                />
              ) : (
                <FileIcon kind={kind} />
              )}
              <div>
                <div style={{ fontSize: 14 }}>{item.title}</div>
                <div style={{ fontSize: 12, color: COLORS.textSecondary }}>
                  {asset
                    ? `${FILE_KIND_LABELS[kind]} · ${formatBytes(asset.sizeBytes)} · ${asset.status}`
                    : "no file"}
                </div>
              </div>
            </div>
            {asset && asset.status === "READY" && (
              <a
                href={`/api/assets/${asset.id}/download`}
                style={{ fontSize: 13, color: COLORS.accent, textDecoration: "none", fontWeight: 600 }}
              >
                Download
              </a>
            )}
          </li>
        );
      })}
    </ul>
  );
}
