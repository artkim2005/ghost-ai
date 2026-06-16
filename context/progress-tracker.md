# Progress Tracker

Update this file whenever the current phase, active feature, or implementation state changes.

## Current Phase
- Feature 05 complete. Next feature TBD.

## Current Goal
- Awaiting next feature spec.

## Completed

- Feature 01: Design System — shadcn/ui configured, 7 UI components added (Button, Card, Dialog, Input, Tabs, Textarea, ScrollArea), lucide-react installed, globals.css dark theme tokens set up with @theme inline Tailwind v4 mappings, lib/utils.ts cn() helper created.
- Feature 02: Editor Shell — EditorNavbar (fixed top bar, sidebar toggle with PanelLeftOpen/PanelLeftClose, left/center/right layout) and ProjectSidebar (floating overlay, slide-in from left, Projects title + X close, My Projects/Shared tabs with empty states, New Project button) created in components/editor/.
- Feature 03: Auth — @clerk/ui installed; Clerk env vars added (SIGN_IN_URL, SIGN_UP_URL, AFTER_SIGN_IN_URL, AFTER_SIGN_UP_URL); proxy.ts at project root wraps clerkMiddleware with createRouteMatcher to protect all routes except /sign-in and /sign-up; ClerkProvider wraps root layout using dark theme from @clerk/ui/themes with CSS variable overrides (no hardcoded colors); sign-in and sign-up pages use two-panel layout (info panel left on lg+, Clerk form right); app/page.tsx redirects authenticated users to /editor and unauthenticated users to /sign-in; UserButton added to EditorNavbar right section; minimal app/editor/page.tsx shell created with EditorNavbar and ProjectSidebar.
- Feature 04: Project Dialogues — /editor home screen with heading, description, and New Project button; useProjectDialogs hook managing dialog/form/loading state; Create/Rename/Delete dialogs in components/editor/project-dialogs.tsx; sidebar updated with project item list, hover-reveal rename/delete actions (owned projects only), mobile backdrop scrim, New Project button wired to Create dialog; mock project data in lib/mock-projects.ts; no API calls or persistence.
- Feature 05: Prisma — Project and ProjectCollaborator models in prisma/models/project.prisma (ProjectStatus enum DRAFT/ARCHIVED, cascade delete, unique project/email constraint, indexes on ownerId, createdAt, email, projectId/createdAt); lib/prisma.ts cached singleton branching on DATABASE_URL (prisma+postgres:// → accelerateUrl, postgres:// → @prisma/adapter-pg); migration 20260616200841_init applied; client generated to app/generated/prisma/.

## In Progress

- None.

## Next Up
- Add the next planned feature unit here.

## Open Questions

- Add unresolved product or implementation questions here.

## Architecture Decisions

- Next.js 16 uses proxy.ts (renamed from middleware.ts) with export function proxy(). clerkMiddleware returns NextMiddleware which is compatible with NextProxy.
- Prisma v7 PrismaClient constructor requires either `adapter` (SqlDriverAdapterFactory) or `accelerateUrl` (string) — no zero-argument constructor. The lib/prisma.ts singleton branches on DATABASE_URL prefix to pick the right option.

## Session Notes

- Add context needed to resume work in the next session.
