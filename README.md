# My Digital Life

Everything that matters, preserved.

## What this is

My Digital Life is a private, single-user personal vault for photos, documents, records, and the real-world "things" (vehicles, equipment, property) they relate to. The long-term goal is a system that stays fast, organized, and recoverable even after decades and hundreds of thousands of items.

## Current status

This repository currently contains **planning and architecture documentation only** — no application code has been written or verified yet. These docs were authored through a browser automation tool with no terminal, package manager, or build system available, so no code here has been compiled, migrated, or tested. Treat everything as a design proposal to be implemented and verified in a real development environment (e.g. Claude Code, or a local/CI toolchain with Node.js, PostgreSQL, and a Railway account).

See the `docs/` folder for the detailed design:

- `docs/ARCHITECTURE.md` — overall system architecture and technology choices
- - `docs/DATABASE.md` — PostgreSQL/Prisma schema direction
  - - `docs/STORAGE.md` — object storage layout and original-file preservation rules
    - - `docs/SECURITY.md` — authentication, authorization, and data protection
      - - `docs/UI.md` — design system and page/route architecture
        - - `docs/ROADMAP.md` — phased implementation plan
         
          - ## Planned technology stack
         
          - - Next.js (App Router) + TypeScript + React
            - - Tailwind CSS with a custom design system
              - - PostgreSQL + Prisma
                - - S3-compatible private object storage (Railway)
                  - - Deployment target: Railway
                   
                    - ## Core principles
                   
                    - - The original file is sacred — never destructively modified, only referenced by generated derivatives (thumbnails/previews).
                      - - Private and single-user by default. No public sign-up, no public file listing.
                        - - Designed from day one for scale (100,000+ items) using pagination, indexing, and background processing rather than loading everything at once.
                          - - No fake functionality — every visible feature works, or it isn't shown yet.
                            - - Full data portability — original files and metadata must always be exportable in a human-readable form.
                             
                              - ## Next steps
                             
                              - Implementation (Next.js app, Prisma schema/migrations, storage integration, auth, UI) needs to happen in an environment with real file system, terminal, database, and deployment access. This repo's docs are meant to guide that build.
                              - 
