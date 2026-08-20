// Library page: renders folders and files with real file-type icons,
// wrapped in the shared application shell. Also supports a flat, type
// filtered view and a Favorites view - both real, backed by the database.
import Link from "next/link";
import { prisma } from "@/lib/db";
import NewFolderForm from "./NewFolderForm";
import UploadForm from "./UploadForm";
import FileIcon from "./FileIcon";
import FavoriteButton from "./FavoriteButton";
import DeleteButton from "./DeleteButton";
import PhotoGallery from "./PhotoGallery";
import { getFileKind, FILE_KIND_LABELS } from "@/lib/fileKind";
import { formatBytes } from "@/lib/format";
import AppShell from "../components/AppShell";
import Breadcrumbs from "../components/Breadcrumbs";
import EmptyState from "../components/EmptyState";
import { COLORS, RADIUS } from "../components/theme";
import { IconFolder, IconDocument } from "../components/icons";

// Always read fresh from the database - this is a private vault for one
// user, not a page we ever want cached or statically generated.
export const dynamic = "force-dynamic";

const TYPE_TABS: { label: string; value: string }[] = [
  { label: "All", value: "all" },
  { label: "Photos", value: "PHOTO" },
  { label: "Documents", value: "DOCUMENT" },
  { label: "Videos", value: "VIDEO" },
  { label: "Other", value: "OTHER" },
];

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
  searchParams?: { folder?: string; search?: string; type?: string; view?: string };
}) {
  const folderId =
    searchParams?.folder && searchParams.folder.length > 0 ? searchParams.folder : null;
  const search = searchParams?.search?.trim() || "";
  const type = searchParams?.type && searchParams.type !== "all" ? searchParams.type : null;
  const view = searchParams?.view || null;

  // Text search: flat, across the whole vault.
  if (search) {
    const results: any[] = await prisma.item.findMany({
      where: {
        deletedAt: null,
        title: { contains: search, mode: "insensitive" },
        ...(type ? { type: type as any } : {}),
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

  // Favorites: flat, across the whole vault.
  if (view === "favorites") {
    const results: any[] = await prisma.item.findMany({
      where: {
        deletedAt: null,
        favorite: true,
        ...(type ? { type: type as any } : {}),
      },
      include: { assets: true },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return (
      <AppShell active="favorites" currentFolderId={null}>
        <div style={{ maxWidth: 1000, margin: "0 auto", padding: "32px 32px 64px" }}>
          <Breadcrumbs items={[{ label: "Library", href: "/vault" }, { label: "Favorites" }]} />
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: "16px 0 24px" }}>Favorites</h1>
          <FilterTabs activeType={type || "all"} basePath="/vault?view=favorites" />
          {results.length === 0 ? (
            <EmptyState
              icon={<IconDocument size={40} />}
              title="No favorites yet"
              description="Star anything from your Library to find it here quickly."
            />
          ) : (
            <ItemList items={results} />
          )}
        </div>
      </AppShell>
    );
  }

  // Type filter: flat, across the whole vault.
  if (type) {
    const activeTab = TYPE_TABS.find((t) => t.value === type);
    const results: any[] = await prisma.item.findMany({
      where: { deletedAt: null, type: type as any },
      include: { assets: true },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return (
      <AppShell active="library" currentFolderId={null}>
        <div style={{ maxWidth: 1000, margin: "0 auto", padding: "32px 32px 64px" }}>
          <Breadcrumbs
            items={[
              { label: "Library", href: "/vault" },
              { label: activeTab?.label || "Filtered" },
            ]}
          />
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: "16px 0 24px" }}>
            {activeTab?.label || "Filtered"}
          </h1>
          <FilterTabs activeType={type} basePath="/vault" />
          {results.length === 0 ? (
            <EmptyState
              icon={<IconDocument size={40} />}
              title={`No ${(activeTab?.label || "items").toLowerCase()} yet`}
              description="Anything you upload of this type will appear here."
            />
          ) : (
            <ItemList items={results} />
          )}
        </div>
      </AppShell>
    );
  }

  // Default: folder browsing.
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

        {!folderId && !isEmpty && <FilterTabs activeType="all" basePath="/vault" />}

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

function FilterTabs({ activeType, basePath }: { activeType: string; basePath: string }) {
  const hasQuery = basePath.includes("?");
  return (
    <div style={{ display: "flex", gap: 6, marginBottom: 24, flexWrap: "wrap" }}>
      {TYPE_TABS.map((tab) => {
        const isActive = activeType === tab.value;
        const href =
          tab.value === "all" ? basePath : `${basePath}${hasQuery ? "&" : "?"}type=${tab.value}`;
        return (
          <Link
            key={tab.value}
            href={href}
            style={{
              padding: "7px 14px",
              borderRadius: RADIUS.md,
              fontSize: 13,
              fontWeight: 600,
              textDecoration: "none",
              color: isActive ? "#fff" : COLORS.textSecondary,
              background: isActive ? COLORS.accent : COLORS.surface,
              border: `1px solid ${isActive ? COLORS.accent : COLORS.border}`,
            }}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
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

// Splits items into real photos (shown in a visual click-through gallery)
// and everything else (shown as a compact file list), so photos finally
// get a gallery experience instead of being buried in a row of text.
function ItemList({ items }: { items: any[] }) {
  const photoItems = items.filter((item: any) => {
    const asset = item.assets.find((a: any) => a.isOriginal && a.status === "READY");
    return !!asset && getFileKind(asset.mimeType, asset.originalName) === "photo";
  });
  const photoIds = new Set(photoItems.map((item: any) => item.id));
  const otherItems = items.filter((item: any) => !photoIds.has(item.id));

  return (
    <>
      {photoItems.length > 0 && (
        <PhotoGallery
          photos={photoItems.map((item: any) => {
            const asset = item.assets.find((a: any) => a.isOriginal && a.status === "READY");
            return {
              id: item.id,
              title: item.title,
              assetId: asset.id,
              favorite: !!item.favorite,
            };
          })}
        />
      )}

      {otherItems.length > 0 && (
        <>
          <style>{`
            .item-row {
              transition: box-shadow 0.15s ease, border-color 0.15s ease, transform 0.15s ease;
            }
            .item-row:hover {
              box-shadow: 0 8px 20px rgba(20,20,40,0.08);
              border-color: ${COLORS.accent};
              transform: translateY(-1px);
            }
          `}</style>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {otherItems.map((item: any) => {
              const asset = item.assets.find((a: any) => a.isOriginal);
              // A real generated thumbnail derivative (isOriginal: false), not
              // just "the original happens to be ready" - photos get one from
              // the thumbnail pipeline, but videos/PDFs/other files usually
              // don't, so they should fall back to the FileIcon badge instead
              // of a broken <img> pointing at a thumbnail that doesn't exist.
              const thumbnailAsset = item.assets.find(
                (a: any) => !a.isOriginal && a.status === "READY"
              );
              const kind = getFileKind(asset?.mimeType, asset?.originalName);
              return (
                <li
                  key={item.id}
                  className="item-row"
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
                    {thumbnailAsset ? (
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
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <FavoriteButton itemId={item.id} initialFavorite={!!item.favorite} />
                    <DeleteButton itemId={item.id} itemTitle={item.title} />
                    {asset && asset.status === "READY" && (
                      <a
                        href={`/api/assets/${asset.id}/download`}
                        style={{
                          fontSize: 13,
                          color: COLORS.accent,
                          textDecoration: "none",
                          fontWeight: 600,
                          marginLeft: 8,
                        }}
                      >
                        Download
                      </a>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </>
  );
}
