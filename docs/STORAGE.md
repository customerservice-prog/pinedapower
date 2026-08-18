# Storage architecture

Status: design proposal, not yet implemented.

## Principle: the original file is sacred

Once an original is uploaded, it is never modified, recompressed, or overwritten. Every generated derivative (thumbnail, gallery image, large preview) is a separate object. If every derivative were deleted, the system should be able to regenerate them from the original alone.

## Storage key layout

Keys use opaque asset IDs (UUIDs), not user-supplied filenames, to avoid collisions and path-traversal issues. Conceptually:

```
users/{userId}/originals/{assetId}.{ext}
users/{userId}/thumbnails/{assetId}.webp
users/{userId}/gallery/{assetId}.webp
users/{userId}/previews/{assetId}.webp
users/{userId}/exports/{exportJobId}/...
```

The original's real filename, MIME type, and byte size are stored in Postgres, not encoded into the storage key.

## Direct uploads

Large files (photos, videos, PDFs) go directly from the browser to object storage using short-lived signed upload URLs, rather than proxying bytes through the Next.js server. The server's role is limited to: authorizing the request, generating the asset ID, issuing the signed URL, and later confirming the object exists and finalizing metadata. This keeps the app server from becoming a bandwidth bottleneck and avoids buffering large uploads in server memory.

## Derivative pipeline

After an original is confirmed uploaded, a background job (not the web request) generates:

- a small thumbnail (roughly 250-400px) for grid views
- a gallery-sized image (roughly 800-1200px) for browsing
- a large preview (roughly 1920px) for the full-screen viewer

Derivatives use modern, widely-supported formats (e.g. WebP) where practical. EXIF orientation is respected when generating derivatives so thumbnails are never sideways, but the original bytes (including their orientation tag) are left untouched. If derivative generation fails, the original remains safely stored and the item is flagged for retry - it is never deleted or blocked on deriving a preview.

## HEIC and unsupported formats

If a browser cannot render a format natively (e.g. HEIC from iPhones), the original is still stored as-is, and a compatible preview/thumbnail is generated for display. Downloading always returns the true original file, in its original format.

## Privacy and access

The storage bucket is private. Nothing is served via long-lived public URLs. Files are served either through an authenticated proxy route or a short-lived signed download URL, and every request re-checks that the authenticated user owns the requested asset before granting access. Thumbnails and previews get the same protection as originals, since they can be just as sensitive.

## Checksums and integrity

Each original's SHA-256 checksum is computed and stored after upload, and used for exact-duplicate detection and future integrity verification. A checksum mismatch on a later integrity scan is flagged for review rather than silently "fixed" by overwriting anything.

## Deletion

Deleting an item moves it to Trash (soft delete) first. Permanent deletion is a separate, deliberate action that removes the original, its derivatives, and related metadata together, with handling for partial failures (e.g. object already removed, or removal failing after the DB record is gone) via a reconciliation/orphan-cleanup process rather than assuming every deletion step always succeeds atomically.

## Export

Exports are generated as background jobs, not built synchronously in a web request, and use human-readable folder structures (e.g. by Space/Thing/Album) plus JSON metadata, so the archive is understandable even without this application. Very large exports are split into multiple archive files instead of one unbounded ZIP built in memory.
