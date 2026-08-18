# UI / design system and routes

Status: design proposal, not yet implemented.

## Design character

Premium, calm, personal, and spacious rather than an admin-dashboard look. Inspiration is drawn from the level of polish in apps like Apple Photos, Google Photos/Drive, Notion, and Linear - not copied, but used as a bar for typography, whitespace, and restraint. Photos and documents should visually dominate; navigation and chrome should fade into the background.

Restraint matters: not every card is glassmorphism, not every button glows, not everything animates. Light and dark mode are both intentionally designed (dark mode is not a simple color inversion), and the chosen theme is stored and applied without a flash of the wrong theme on load.

## Design tokens

Centralized rather than scattered hex values: background, surface, surfaceElevated, textPrimary, textSecondary, border, accent, danger, success, warning, spacing scale, radius scale, shadow scale, typography scale, and animation durations. Both themes are built from the same token names.

## Primary navigation (desktop)

Home, Library, Photos, Documents, Albums, Favorites, then a "Life" section with Spaces, Things, Timeline, then Inbox, Archive, Trash, and a bottom section for Settings/Backup/Account. A prominent "+ Add to My Life" action and global search are always reachable.

## Mobile navigation

A bottom navigation bar (e.g. Home, Photos, Library, Search, Me) rather than a shrunk desktop sidebar, plus a floating add action exposing the same core creation flows (take photo, scan document, upload, create note).

## Command palette

Cmd/Ctrl+K opens a command palette for power users (search, upload, create album/folder/space, add thing, jump to a section). Everything reachable there must also be reachable through normal navigation - the palette is a shortcut, not the only path.

## Information architecture

- Space = a major area of life (Personal, Business, etc).
- Folder = filing hierarchy within a Space.
- Album = a curated photo collection (not a filesystem folder; an item can be in many albums without duplicating bytes).
- Thing = a real-world object (vehicle, equipment, property) that documents/photos/notes can attach to.
- Tag = a flexible, many-to-many label.
- Inbox = newly added items awaiting organization.
- Archive = hidden but retained; Trash = soft-deleted and recoverable.

If a screen requires explaining the difference between two of these concepts to a new user, that is a signal to simplify rather than add a glossary.

## Key routes (conceptual)

```
/                current: home
/library         all item types
/photos          /photos/[id]
/documents       /documents/[id]
/albums/[id]
/things/[id]
/spaces/[id]
/folders/[id]
/search?q=...
/inbox
/trash
/settings
```

Object storage paths are never exposed in these routes; routes reference opaque item/asset IDs, and the server resolves access.

## Core reusable components

AppShell, Sidebar, MobileNav, TopBar, GlobalSearch, Button, IconButton, Dropdown, Dialog, Sheet, Card, PhotoTile, DocumentCard, EmptyState, Skeleton, Toast, FilterBar, CommandPalette, MetadataRow, FilePreview. Screens compose these rather than duplicating similar markup.

## Photo gallery and viewer

A justified/masonry-style grid that respects real aspect ratios (not a forced square grid), grouped by day/month/year depending on the current view, using virtualization so the DOM stays small regardless of library size, with aspect-ratio placeholders to avoid layout shift while images load. Opening a photo goes to an immersive full-screen viewer (dark background even in light mode) with keyboard (arrows, escape), mouse, and touch (swipe, pinch) navigation, and preloads the neighboring preview so moving between photos feels instant. Scroll position in the grid is preserved when returning from the viewer.

## Loading, empty, and error states

Skeleton placeholders and aspect-ratio boxes instead of full-page spinners; every empty screen (empty library, empty inbox, empty trash, empty album) has a specific, useful message and a relevant primary action; errors shown to the user are plain-language and actionable (e.g. "3 files failed to upload - Retry"), while technical detail stays in server logs.

## No fake functionality

A button or feature is only shown once it works. Features that are not built yet are simply not shown, rather than shown disabled or "coming soon" as decoration.
