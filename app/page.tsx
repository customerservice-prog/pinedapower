import { prisma } from "@/lib/db";
import AppShell from "./components/AppShell";
import EmptyState from "./components/EmptyState";
import UploadForm from "./vault/UploadForm";
import NewFolderForm from "./vault/NewFolderForm";
import { COLORS, RADIUS } from "./components/theme";

// Always read fresh from the database - this is a private vault for one
// user, not a page we ever want cached or statically generated.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const itemCount = await prisma.item.count({ where: { deletedAt: null } });

  return (
    <AppShell active="home" currentFolderId={null}>
      <div style={{ maxWidth: 880, margin: "0 auto", padding: "56px 32px 64px" }}>
        <div style={{ fontSize: 34, fontWeight: 700, marginBottom: 8 }}>Good morning.</div>
        <div style={{ fontSize: 16, color: COLORS.textSecondary, marginBottom: 40 }}>
          {itemCount > 0
            ? "Everything that matters, in one place."
            : "Your digital life starts here."}
        </div>

        {itemCount === 0 && (
          <>
            <EmptyState
              title="Preserve the photos, documents and records you never want to lose."
              description="Start by adding something from your life below. Everything stays private, and originals are never altered."
            />
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: 16,
                marginTop: 8,
              }}
            >
              <QuickActionCard
                title="Upload Photos"
                description="Preserve your memories and browse them beautifully."
              >
                <UploadForm folderId={null} label="Upload Photos" accept="image/*" />
              </QuickActionCard>
              <QuickActionCard
                title="Add Documents"
                description="Keep important paperwork searchable and printable."
              >
                <UploadForm folderId={null} label="Upload File" />
              </QuickActionCard>
              <QuickActionCard
                title="Create a Folder"
                description="Organize personal, family or business records."
              >
                <NewFolderForm parentId={null} />
              </QuickActionCard>
            </div>
          </>
        )}

        {itemCount > 0 && (
          <EmptyState
            title="Your library is growing."
            description={`You have ${itemCount} item${itemCount === 1 ? "" : "s"} preserved so far. Open your Library to browse, organize and add more.`}
          />
        )}
      </div>
    </AppShell>
  );
}

function QuickActionCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        border: `1px solid ${COLORS.border}`,
        borderRadius: RADIUS.lg,
        background: COLORS.surface,
        padding: 20,
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <div>
        <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>{title}</div>
        <div style={{ fontSize: 13, color: COLORS.textSecondary, lineHeight: 1.5 }}>{description}</div>
      </div>
      <div>{children}</div>
    </div>
  );
}
