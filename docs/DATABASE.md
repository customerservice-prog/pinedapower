# Database schema direction

Status: design proposal - not yet implemented as Prisma migrations.

## Principles

- One normalized `Item` concept underlies Photo, Document, Note, and Thing, instead of separate unrelated tables per feature.
- Foreign keys and constraints are used deliberately; cascades are only used where losing dependent rows automatically is genuinely safe.
- Soft delete (`deletedAt`) is used for anything the user can restore from Trash. Permanent delete is a separate, explicit operation.
- Every large/listable table has indexes matching real query patterns (see below), not a blanket index-everything approach.

## Conceptual models

- `User` - single row for v1, but modeled properly so it is not a special case.
- `Item` - shared fields: id, type (photo/document/note/thing/album/...), title, description, spaceId, folderId, favorite, archived, createdAt, updatedAt, deletedAt.
- `Asset` - a stored file: storageKey, originalFilename, mimeType, byteSize, checksum (sha-256), width/height where applicable, processingState, thumbnailKey, galleryKey, previewKey, derivativeVersion.
- `Photo` / `Document` - extend Item plus reference an Asset; Photo adds takenAt, camera/lens/EXIF fields, gps (optional); Document adds category, expiresAt, issuedAt.
- `Folder` - self-referencing parent/child for nested hierarchy, belongs to a Space.
- `Space` - top-level life area (Personal, Business, etc).
- `Album` / `AlbumItem` - many-to-many join between albums and items (a photo can be in many albums without duplicating bytes).
- `Thing` / `ThingItem` - a real-world object plus a join table linking documents, photos, and notes to it.
- `Tag` / `ItemTag` - many-to-many, tag names normalized (lowercased/trimmed) for matching while preserving a display label.
- `DocumentVersion` - links an older Asset to a newer one for the same logical document.
- `UploadBatch` / `UploadItem` - tracks a batch upload's per-file progress/status for reliable large-batch UX.
- `ProcessingJob` - id, assetId, type, status, attempts, lastError, timestamps - drives background thumbnail/metadata generation.
- `ActivityEvent` - meaningful actions only (moved, renamed, attached), not a page-view log.
- `ExportJob` - tracks export requests/status for full or partial archive export.

## Indexing plan

Likely indexes/composites, chosen for actual query patterns rather than indexing everything:

- `Item(spaceId, folderId)` for folder browsing
- `Item(type, createdAt)` and `Item(type, favorite)` for filtered lists
- `Photo(takenAt, id)` composite as the stable cursor-pagination key (handles ties on identical timestamps)
- `Item(deletedAt)` partial index for Trash queries
- `Tag(normalizedName)` unique
- `Asset(checksum)` for duplicate detection
- `ProcessingJob(status, type)` for worker polling

## Pagination

List endpoints use cursor pagination on an indexed key (e.g. `takenAt, id` or `createdAt, id`), never large `OFFSET` values. This keeps performance stable whether the library has 200 or 200,000 rows.

## What this schema deliberately avoids

- No per-feature duplicate tables like `CarPhoto`, `HousePhoto`, `VacationPhoto` - relationships (Thing, Album, Space, Folder, Tag) handle all of these cases through the shared Item/Asset model.
- No storing file bytes or large blobs in Postgres columns.
- No unbounded nested folder depth without a sane UI/UX cap, even though the schema supports arbitrary nesting.
