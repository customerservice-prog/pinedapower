import { COLORS } from "./theme";

export default function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        padding: "64px 24px",
        gap: 10,
      }}
    >
      {icon && <div style={{ color: COLORS.textTertiary, marginBottom: 4 }}>{icon}</div>}
      <div style={{ fontSize: 18, fontWeight: 600, color: COLORS.textPrimary }}>{title}</div>
      {description && (
        <div
          style={{
            fontSize: 14,
            color: COLORS.textSecondary,
            maxWidth: 380,
            lineHeight: 1.5,
          }}
        >
          {description}
        </div>
      )}
      {action && <div style={{ marginTop: 14 }}>{action}</div>}
    </div>
  );
}
