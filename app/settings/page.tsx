import AppShell from "../components/AppShell";
import { COLORS, RADIUS } from "../components/theme";

export const dynamic = "force-dynamic";

export default function SettingsPage() {
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
          }}
        >
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
            Account
          </div>
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

        <div style={{ fontSize: 13, color: COLORS.textSecondary, marginTop: 24 }}>
          More settings (appearance, storage, backups) will appear here as those features are
          built.
        </div>
      </div>
    </AppShell>
  );
}
