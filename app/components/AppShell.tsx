import { COLORS } from "./theme";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";

export default function AppShell({
  active,
  currentFolderId = null,
  children,
}: {
  active: "home" | "library" | "settings";
  currentFolderId?: string | null;
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: COLORS.background }}>
      <Sidebar active={active} />
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <TopBar currentFolderId={currentFolderId} />
        <main style={{ flex: 1, color: COLORS.textPrimary }}>{children}</main>
      </div>
    </div>
  );
}
