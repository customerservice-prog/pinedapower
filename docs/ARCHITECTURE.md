# Architecture

Status: design proposal, not yet implemented or verified.

## Overview

My Digital Life is a single-tenant, single-user web application for preserving photos, documents, and metadata about real-world "things". It is built as a modular monolith rather than microservices, favoring operational simplicity for a personal-scale system while still separating concerns cleanly in code.

## Technology stack

- Next.js (App Router), TypeScript, React for the application layer (UI + API routes/server actions)
- Tailwind CSS for styling, with a small custom design-token layer on top
- PostgreSQL for all structured metadata
- Prisma as the type-safe database client and migration tool
- S3-compatible private object storage (Railway bucket) for original files and generated derivatives
- Railway for hosting the app, Postgres, and object storage

## High-level layers

```
app/          route handlers, pages, layouts (thin)
components/   reusable UI primitives and composed views
lib/          auth, database client, storage client, validation schemas, utilities
services/     business logic: items, uploads, photos, documents, albums, things, search, export
jobs/         background processing: thumbnails, metadata extraction, exports
prisma/       schema.prisma and migrations
```

Route handlers and server actions stay thin: validate input, call a service function, return a result. Business logic lives in `services/`, not inline in routes. Storage access is centralized behind a small storage-service abstraction (`createUploadUrl`, `createDownloadUrl`, `deleteObject`, `objectExists`) so no code outside that module talks to the storage SDK directly.

## Database vs. object storage

PostgreSQL stores information ABOUT files (titles, dates, tags, relationships, dimensions, checksums, processing state). Object storage stores the actual bytes (originals and derivatives). Large binary data is never stored in Postgres rows.

## Upload flow (conceptual)

1. Client requests a signed upload URL for a specific asset ID from the server (server verifies the request, generates the ID, records a PENDING row).
2. Client uploads the file directly to object storage using that signed URL (bypasses the app server for the bytes).
3. Client confirms completion; server verifies the object exists, computes/stores a checksum, and marks the record UPLOADED.
4. A background job extracts metadata (EXIF, dimensions), generates derivatives (thumbnail, gallery, preview), and marks the record READY. If this step fails, the original remains untouched and the item is marked for retry.

## Scale considerations

All list views (photos, documents, library) use cursor-based pagination on an indexed ordering key (e.g. `takenAt, id`), never `OFFSET` on large tables and never selecting all rows and filtering in React. The photo grid uses virtualization so the DOM only contains nodes near the viewport regardless of library size. See `docs/DATABASE.md` for indexing details and `docs/ROADMAP.md` for the 100,000-item acceptance test.

## Security posture

Single authenticated user; no public sign-up route. Every server-side route/action re-checks authorization rather than trusting client-supplied IDs. Object storage is private; files are served through authenticated routes or short-lived signed URLs, never long-lived public links. Full detail in `docs/SECURITY.md`.

## Deployment

Targets Railway: a web service (Next.js), a managed PostgreSQL instance, and a private object storage bucket, wired together with environment variables (see `.env.example`). The app container's local filesystem is treated as ephemeral - nothing persistent is ever written to local disk.
