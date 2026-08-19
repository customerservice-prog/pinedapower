import Link from "next/link";
import { COLORS } from "./theme";
import { IconChevronRight } from "./icons";

export type Crumb = { label: string; href?: string };

export default function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav
      aria-label="Breadcrumb"
      style={{
        display: "flex",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 6,
        fontSize: 14,
        color: COLORS.textSecondary,
      }}
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <span key={index} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {index > 0 && <IconChevronRight size={14} />}
            {item.href && !isLast ? (
              <Link
                href={item.href}
                style={{
                  color: COLORS.textSecondary,
                  textDecoration: "none",
                }}
              >
                {item.label}
              </Link>
            ) : (
              <span
                style={{
                  color: isLast ? COLORS.textPrimary : COLORS.textSecondary,
                  fontWeight: isLast ? 600 : 400,
                }}
              >
                {item.label}
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
