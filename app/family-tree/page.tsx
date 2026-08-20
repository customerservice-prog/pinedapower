import { prisma } from "@/lib/db";
import AppShell from "../components/AppShell";
import EmptyState from "../components/EmptyState";
import AddMemberForm from "./AddMemberForm";
import FamilyDeleteButton from "./FamilyDeleteButton";
import { COLORS, RADIUS, SHADOW } from "../components/theme";
import { IconUsers } from "../components/icons";

// Always read fresh from the database - same reasoning as the vault page.
export const dynamic = "force-dynamic";

const GENDER_COLORS: Record<string, string> = {
  MALE: "#4a90d9",
  FEMALE: "#d9569c",
  OTHER: "#9d5bd9",
  UNKNOWN: "#96969f",
};

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getYearsLabel(member: any) {
  if (member.birthYear && member.deathYear) return `${member.birthYear} – ${member.deathYear}`;
  if (member.birthYear) return `b. ${member.birthYear}`;
  if (member.deathYear) return `d. ${member.deathYear}`;
  return null;
}

export default async function FamilyTreePage() {
  const members: any[] = await prisma.familyMember.findMany({
    orderBy: { createdAt: "asc" },
  });

  const memberOptions = members.map((m) => ({ id: m.id, name: m.name }));

  return (
    <AppShell active="family" currentFolderId={null}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 32px 64px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            margin: "0 0 12px",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>Family Tree</h1>
          <AddMemberForm members={memberOptions} />
        </div>

        {members.length === 0 ? (
          <EmptyState
            icon={<IconUsers size={40} />}
            title="Your family tree is empty"
            description="Add your first family member to start building your tree - you can link parents and a spouse as you go."
          />
        ) : (
          <FamilyTree members={members} />
        )}
      </div>
    </AppShell>
  );
}

function PersonCard({ member }: { member: any }) {
  const initials = getInitials(member.name);
  const years = getYearsLabel(member);
  const color = GENDER_COLORS[member.gender] || GENDER_COLORS.UNKNOWN;

  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 6,
        padding: "14px 16px",
        minWidth: 130,
        background: COLORS.surface,
        border: `1px solid ${COLORS.border}`,
        borderRadius: RADIUS.lg,
        boxShadow: SHADOW.menu,
      }}
    >
      <div style={{ position: "absolute", top: 4, right: 4 }}>
        <FamilyDeleteButton memberId={member.id} memberName={member.name} size={14} />
      </div>
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: "50%",
          background: color,
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 700,
          fontSize: 15,
        }}
      >
        {initials}
      </div>
      <div
        style={{ fontSize: 14, fontWeight: 600, color: COLORS.textPrimary, textAlign: "center" }}
      >
        {member.name}
      </div>
      {years && <div style={{ fontSize: 12, color: COLORS.textSecondary }}>{years}</div>}
      {member.notes && (
        <div
          style={{
            fontSize: 11,
            color: COLORS.textTertiary,
            textAlign: "center",
            maxWidth: 150,
          }}
        >
          {member.notes}
        </div>
      )}
    </div>
  );
}

// Builds a real branching tree from the flat member list: starts at anyone
// with no recorded parents, groups spouses side by side, and nests each
// couple's children below - using a pure-CSS org-chart connector technique
// (the .family-tree rules below) instead of a bespoke layout library.
function FamilyTree({ members }: { members: any[] }) {
  const byId: Record<string, any> = {};
  members.forEach((m) => (byId[m.id] = m));
  const rendered = new Set<string>();

  function getSpouse(member: any) {
    if (member.spouseId && byId[member.spouseId]) return byId[member.spouseId];
    return members.find((m) => m.spouseId === member.id) || null;
  }

  function getChildren(ids: Set<string>) {
    return members.filter(
      (m) => (m.parentId1 && ids.has(m.parentId1)) || (m.parentId2 && ids.has(m.parentId2))
    );
  }

  function renderNode(member: any): React.ReactNode {
    if (rendered.has(member.id)) return null;
    rendered.add(member.id);
    const spouse = getSpouse(member);
    if (spouse) rendered.add(spouse.id);
    const ids = new Set<string>([member.id]);
    if (spouse) ids.add(spouse.id);
    const children = getChildren(ids).filter((c) => !rendered.has(c.id));

    return (
      <li key={member.id}>
        <div className="couple">
          <PersonCard member={member} />
          {spouse && (
            <>
              <div
                style={{
                  alignSelf: "center",
                  color: COLORS.textTertiary,
                  fontSize: 18,
                  padding: "0 2px",
                }}
              >
                ⚭
              </div>
              <PersonCard member={spouse} />
            </>
          )}
        </div>
        {children.length > 0 && <ul>{children.map((child) => renderNode(child))}</ul>}
      </li>
    );
  }

  const roots = members.filter((m) => !m.parentId1 && !m.parentId2);
  const rootNodes = roots.map((root) => renderNode(root)).filter(Boolean);

  return (
    <>
      <style>{`
        .family-tree, .family-tree ul {
          list-style: none;
          margin: 0;
          padding: 0;
        }
        .family-tree {
          display: flex;
          justify-content: center;
          padding: 20px 20px 40px;
          overflow-x: auto;
        }
        .family-tree ul {
          display: flex;
          padding-top: 40px;
          position: relative;
        }
        .family-tree li {
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
          padding: 40px 14px 0 14px;
        }
        .family-tree li::before,
        .family-tree li::after {
          content: "";
          position: absolute;
          top: 0;
          width: 50%;
          height: 40px;
          border-top: 2px solid ${COLORS.border};
        }
        .family-tree li::before { right: 50%; border-right: 2px solid ${COLORS.border}; }
        .family-tree li::after { left: 50%; border-left: 2px solid ${COLORS.border}; }
        .family-tree li:only-child { padding-top: 0; }
        .family-tree li:only-child::before,
        .family-tree li:only-child::after { display: none; }
        .family-tree li:first-child::before { border: 0 none; }
        .family-tree li:last-child::after { border: 0 none; }
        .family-tree > li { padding-top: 0; }
        .family-tree > li::before,
        .family-tree > li::after { display: none; }
        .family-tree ul::before {
          content: "";
          position: absolute;
          top: 0;
          left: 50%;
          width: 0;
          height: 40px;
          border-left: 2px solid ${COLORS.border};
        }
        .family-tree .couple {
          display: flex;
          gap: 4px;
        }
      `}</style>
      <ul className="family-tree">{rootNodes}</ul>
    </>
  );
}
