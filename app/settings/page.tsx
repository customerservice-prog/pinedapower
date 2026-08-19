import AppShell from "../components/AppShell";
import { COLORS, RADIUS } from "../components/theme";
import { prisma } from "@/lib/db";
import { formatBytes } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
const [itemCount, folderCount, storageAgg] = await Promise.all([
prisma.item.count({ where: { deletedAt: null } }),
prisma.folder.count(),
prisma.asset.aggregate({
_sum: { sizeBytes: true },
where: { status: "READY" },
}),
]);

const bytesUsed = storageAgg._sum.sizeBytes || 0;

return (
<AppShell active="settings" currentFolderId={null}>
<div style={{ maxWidth: 640, margin: "0 auto", padding: "48px 32px 64px" }}>
<h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 24 }}>Settings</h1>

<div
style={{
border: `1px solid ${COLORS.border}`,
borderRadius: RADIUS.lg,
background: COLORS.surface,
padding: 24,
marginBottom: 20,
}}
>
<SectionLabel>Account</SectionLabel>
<div style={{ fontSize: 15, marginBottom: 20 }}>Signed in as the vault owner.</div>
<form action="/api/auth/logout" method="POST">
<button
type="submit"
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
Sign Out
</button>
</form>
</div>

<div
style={{
border: `1px solid ${COLORS.border}`,
borderRadius: RADIUS.lg,
background: COLORS.surface,
padding: 24,
}}
>
<SectionLabel>Storage</SectionLabel>
<div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
<Stat label="Used" value={formatBytes(bytesUsed)} />
<Stat label="Items" value={String(itemCount)} />
<Stat label="Folders" value={String(folderCount)} />
</div>
<div style={{ fontSize: 13, color: COLORS.textSecondary, marginTop: 16 }}>
This reflects everything currently stored in your vault, including originals and
generated thumbnails.
</div>
</div>

<div style={{ fontSize: 13, color: COLORS.textSecondary, marginTop: 24 }}>
More settings (appearance, backups) will appear here as those features are built.
</div>
</div>
</AppShell>
);
}

function SectionLabel({ children }: { children: React.ReactNode }) {
return (
<div
style={{
fontSize: 13,
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

function Stat({ label, value }: { label: string; value: string }) {
return (
<div>
<div style={{ fontSize: 22, fontWeight: 700 }}>{value}</div>
<div style={{ fontSize: 12, color: COLORS.textSecondary, marginTop: 2 }}>{label}</div>
</div>
);
}
