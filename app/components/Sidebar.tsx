import Link from "next/link";
import { COLORS } from "./theme";
import { IconHome, IconLibrary, IconSettings } from "./icons";

export default function Sidebar({ active }: { active: "home" | "library" | "settings" }) {
  return (
    <aside
      style={{
        width: 236,
        flexShrink: 0,
        borderRight: `1px solid ${COLORS.border}`,
        background: COLORS.background,
        padding: "20px 12px",
        display: "flex",
        flexDirection: "column",
        gap: 24,
        minHeight: "100vh",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: 0.8,
          color: COLORS.textSecondary,
          textTransform: "uppercase",
          padding: "0 10px",
        }}
      >
        My Digital Life
      </div>

      <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <SidebarLink href="/" label="Home" isActive={active === "home"}>
          <IconHome size={17} />
        </SidebarLink>
        <SidebarLink href="/vault" label="Library" isActive={active === "library"}>
          <IconLibrary size={17} />
        </SidebarLink>
      </nav>

      <div style={{ marginTop: "auto" }}>
        <SidebarLink href="/settings" label="Settings" isActive={active === "settings"}>
          <IconSettings size={17} />
        </SidebarLink>
      </div>
    </aside>
  );
}

function SidebarLink({
  href,
  label,
  isActive,
  children,
}: {
  href: string;
  label: string;
  isActive: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "8px 10px",
        borderRadius: 8,
        textDecoration: "none",
        color: isActive ? COLORS.textPrimary : COLORS.textSecondary,
        background: isActive ? COLORS.surface : "transparent",
        fontSize: 14,
        fontWeight: isActive ? 600 : 500,
      }}
    >
      {children}
      {label}
    </Link>
  );
}
