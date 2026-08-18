// Maps a file's mime type / filename to a small set of human-friendly
// "kinds" used to choose an icon and label in the vault UI. This is
// intentionally simple (no external libraries) so it is fast and reliable
// for every file type, even ones we don't have a real preview for yet.

export type FileKind =
    | "photo"
  | "pdf"
  | "word"
  | "excel"
  | "powerpoint"
  | "video"
  | "audio"
  | "text"
  | "archive"
  | "other";

const EXTENSION_MAP: Record<string, FileKind> = {
    pdf: "pdf",
    doc: "word",
    docx: "word",
    xls: "excel",
    xlsx: "excel",
    csv: "excel",
    ppt: "powerpoint",
    pptx: "powerpoint",
    zip: "archive",
    rar: "archive",
    "7z": "archive",
    txt: "text",
    md: "text",
};

export function getFileKind(mimeType: string | null | undefined, filename: string | null | undefined): FileKind {
    const mime = (mimeType || "").toLowerCase();

  if (mime.startsWith("image/")) return "photo";
    if (mime.startsWith("video/")) return "video";
    if (mime.startsWith("audio/")) return "audio";
    if (mime === "application/pdf") return "pdf";
    if (mime.includes("word")) return "word";
    if (mime.includes("sheet") || mime.includes("excel")) return "excel";
    if (mime.includes("presentation") || mime.includes("powerpoint")) return "powerpoint";
    if (mime.startsWith("text/")) return "text";
    if (mime.includes("zip") || mime.includes("compressed")) return "archive";

  const ext = (filename || "").split(".").pop()?.toLowerCase();
    if (ext && EXTENSION_MAP[ext]) return EXTENSION_MAP[ext];

  return "other";
}

export const FILE_KIND_LABELS: Record<FileKind, string> = {
    photo: "Photo",
    pdf: "PDF",
    word: "Word Document",
    excel: "Spreadsheet",
    powerpoint: "Presentation",
    video: "Video",
    audio: "Audio",
    text: "Text",
    archive: "Archive",
    other: "File",
};

export const FILE_KIND_COLORS: Record<FileKind, string> = {
    photo: "#8b5cf6",
    pdf: "#dc2626",
    word: "#2563eb",
    excel: "#16a34a",
    powerpoint: "#ea580c",
    video: "#7c3aed",
    audio: "#0891b2",
    text: "#64748b",
    archive: "#a16207",
    other: "#6b7280",
};

export const FILE_KIND_GLYPHS: Record<FileKind, string> = {
    photo: "IMG",
    pdf: "PDF",
    word: "DOC",
    excel: "XLS",
    powerpoint: "PPT",
    video: "\u25B6",
    audio: "\u266A",
    text: "TXT",
    archive: "ZIP",
    other: "FILE",
};
