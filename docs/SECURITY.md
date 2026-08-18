# Security

Status: design proposal, not yet implemented.

## Single-user posture

Version 1 is private and single-user. There is no public sign-up page, no public file listing, and no public media browser. Every protected route requires an authenticated session. Being single-user does not relax these requirements - every server-side route or action independently re-checks authorization rather than assuming "the button is hidden, so the route is safe".

## Authentication

- Strong password hashing (e.g. bcrypt/argon2), never plain text or reversible encryption of passwords.
- Secure, HttpOnly, SameSite cookies for sessions; secure-only cookies in production.
- Server-side session validation on every request to a protected route.
- Reasonable session expiration, balanced against not forcing frequent re-logins for a personal app.
- Login attempts are rate-limited to resist brute force, with a cooldown rather than a permanent lockout from a few mistyped passwords.
- No insecure "security question" style recovery. Recovery for a single-user system should go through a documented, secure process (e.g. a recovery secret or CLI-based reset), not through the web UI.
- Architecture should not preclude adding real 2FA later; a fake/placeholder 2FA flow is not implemented.

## Authorization

- Every server-side route and server action re-verifies that the requesting session owns the resource being accessed - client-supplied IDs are never trusted on their own.
- Object storage keys are never derived from client input and are never directly exposed in a way that would let someone guess another object's key.
- Signed download/upload URLs are scoped and short-lived.

## Secrets

Secrets (database URL, auth secret, storage credentials) live in Railway environment variables, never hard-coded and never committed to the repository. `.env.example` documents variable names only, with placeholder values.

## Upload validation

- Allowed MIME types are validated server-side, not inferred solely from the browser-supplied Content-Type header.
- Maximum file size limits are enforced.
- Filenames are sanitized and never used directly as storage keys (see docs/STORAGE.md).
- Malformed or corrupted files are handled defensively; image/video processing has limits to avoid decompression-bomb style issues, and a bad file never crashes the whole processing pipeline or takes down other uploads in the same batch.

## Data protection in transit and at rest

- All traffic is served over HTTPS in production.
- The object storage bucket is private; nothing is exposed via long-lived public URLs.
- Appropriate security headers are set (e.g. X-Frame-Options/frame-ancestors, referrer policy, MIME-sniffing protection, HSTS in production, a Content-Security-Policy tuned to what the app actually needs).

## Privacy by default

- No third-party analytics or trackers by default.
- Photo GPS/location data, if present, is stored privately and is not sent to external services automatically.
- Any future AI-assisted features (auto-tagging, OCR, semantic search) must be opt-in and clearly disclosed before any file content is sent to a third-party service; core functionality never depends on AI being available.

## Sensitive actions

Actions such as exporting the entire archive, permanently emptying Trash, or changing the account password are treated as higher-risk and are candidates for requiring recent re-authentication, even for a single-user system.

## What this document intentionally does not cover yet

Multi-user sharing, public links, and granular permission models are out of scope until the private single-user foundation is solid; see docs/ROADMAP.md.
