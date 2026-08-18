# Roadmap

Status: design proposal. This describes a phased build order; nothing below is implemented yet.

## Guiding rule

Build a small number of features that fully work before adding more. Prefer 20 excellent, working features over 100 partially-working ones. Each phase should leave the app in a genuinely usable, tested state.

## Phase 0 - Architecture

Write docs/ARCHITECTURE.md, docs/DATABASE.md, docs/STORAGE.md, docs/SECURITY.md, docs/UI.md, and this roadmap before writing significant application code. (This phase produced the current docs/ folder.)

## Phase 1 - Application foundation

Next.js + TypeScript + Tailwind app, PostgreSQL + Prisma, authentication, Railway-ready configuration, private object storage integration, base design system, desktop and mobile shell, settings scaffold, error handling, logging.

Acceptance: the app deploys, a single user can sign in securely, and unauthenticated visitors cannot see any content.

## Phase 2 - Core file system

Item/Asset models, direct-to-storage upload flow, database records, original download, file metadata, validation, processing states, a basic Library view.

Acceptance: upload a file, refresh the page, the file still exists, and it can be viewed/downloaded with the original bytes intact.

## Phase 3 - Photo engine

EXIF extraction, thumbnail/gallery/preview generation, cursor-paginated photo list API, virtualized gallery grid, full-screen viewer, favorite, delete/restore, mobile gestures.

Acceptance: a large batch of test photos can be uploaded without the architecture collapsing; the gallery uses thumbnails; the viewer uses previews; originals remain downloadable.

## Phase 4 - Document engine

Document records, categories, tags, folders, PDF preview, print, download, favorite, archive, trash.

Acceptance: a real document (e.g. a scanned PDF) can be uploaded, found, previewed, printed, and downloaded end-to-end.

## Phase 5 - Organization

Inbox, bulk selection and bulk actions, folders, spaces, albums, favorites, archive, recently-added views.

Acceptance: a large batch of uploads can be organized efficiently after the fact, without requiring perfect categorization at upload time.

## Phase 6 - Things

Thing model and types, overview page, attaching documents/photos/notes, custom metadata, history.

Acceptance: create a Thing (e.g. a vehicle), attach its registration and photos, and find everything related from one page.

## Phase 7 - Search

Metadata search across titles, filenames, descriptions, tags, folders, spaces, albums, and things, with results grouped by type.

Acceptance: searching a common word returns relevant, well-organized results quickly.

## Phase 8 - Timeline and memories

Year/month/day timeline navigation, "on this day", recent memories, album enhancements.

Acceptance: browsing the historical archive is enjoyable, not just functional.

## Phase 9 - Backup and export

Metadata export, selected/partial export, full export, checksum verification, human-readable output structure, export status page.

Acceptance: the user's files and metadata can be retrieved independent of the application.

## Phase 10 - OCR (later phase)

Only after the above is stable: OCR jobs, extracted text storage, search inside documents.

## Phase 11 - AI (later phase)

Only after the foundation is solid and OCR exists where relevant: auto-tagging suggestions, classification, semantic search, natural-language queries. Always optional, never required for core functionality.

## Scale checkpoint

Before any phase is considered complete, check it against a mental benchmark of 100,000 items (roughly 70,000 photos, 20,000 documents, 5,000 videos/other, 5,000 notes/things). If a screen or query wouldn't hold up at that scale, fix the architecture before moving to the next phase rather than after.
