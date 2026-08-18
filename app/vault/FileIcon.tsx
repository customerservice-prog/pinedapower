import { FileKind, FILE_KIND_COLORS, FILE_KIND_GLYPHS, FILE_KIND_LABELS } from "@/lib/fileKind";

// Simple, dependency-free "icon" badge for a file kind. This is an honest
// visual (a colored label), not a fake preview of the file's real content -
// real content previews (thumbnails) are generated separately for photos.
export default function FileIcon({ kind, size = 48 }: { kind: FileKind; size?: number }) {
    const color = FILE_KIND_COLORS[kind];
    return (
          <div
                  title={FILE_KIND_LABELS[kind]}
                  style={{
                            width: size,
                            height: size,
                            borderRadius: 6,
                            border: `1px solid ${color}33`,
                            background: `${color}14`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: size >= 40 ? 10 : 9,
                            fontWeight: 600,
                            letterSpacing: 0.3,
                            color,
                            flexShrink: 0,
                  }}
                >
            {FILE_KIND_GLYPHS[kind]}
          </div>
        );
}
