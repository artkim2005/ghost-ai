# Progress Tracker

Update this file whenever the current phase, active feature, or implementation state changes.

## Current Phase
- Feature 09 complete.

## Current Goal
- Awaiting next feature spec.

## Completed

- Feature 01: Design System — shadcn/ui configured, 7 UI components added (Button, Card, Dialog, Input, Tabs, Textarea, ScrollArea), lucide-react installed, globals.css dark theme tokens set up with @theme inline Tailwind v4 mappings, lib/utils.ts cn() helper created.
- Feature 02: Editor Shell — EditorNavbar (fixed top bar, sidebar toggle with PanelLeftOpen/PanelLeftClose, left/center/right layout) and ProjectSidebar (floating overlay, slide-in from left, Projects title + X close, My Projects/Shared tabs with empty states, New Project button) created in components/editor/.
- Feature 03: Auth — @clerk/ui installed; Clerk env vars added (SIGN_IN_URL, SIGN_UP_URL, AFTER_SIGN_IN_URL, AFTER_SIGN_UP_URL); proxy.ts at project root wraps clerkMiddleware with createRouteMatcher to protect all routes except /sign-in and /sign-up; ClerkProvider wraps root layout using dark theme from @clerk/ui/themes with CSS variable overrides (no hardcoded colors); sign-in and sign-up pages use two-panel layout (info panel left on lg+, Clerk form right); app/page.tsx redirects authenticated users to /editor and unauthenticated users to /sign-in; UserButton added to EditorNavbar right section; minimal app/editor/page.tsx shell created with EditorNavbar and ProjectSidebar.
- Feature 04: Project Dialogues — /editor home screen with heading, description, and New Project button; useProjectDialogs hook managing dialog/form/loading state; Create/Rename/Delete dialogs in components/editor/project-dialogs.tsx; sidebar updated with project item list, hover-reveal rename/delete actions (owned projects only), mobile backdrop scrim, New Project button wired to Create dialog; mock project data in lib/mock-projects.ts; no API calls or persistence.
- Feature 05: Prisma — Project and ProjectCollaborator models in prisma/models/project.prisma (ProjectStatus enum DRAFT/ARCHIVED, cascade delete, unique project/email constraint, indexes on ownerId, createdAt, email, projectId/createdAt); lib/prisma.ts cached singleton branching on DATABASE_URL (prisma+postgres:// → accelerateUrl, postgres:// → @prisma/adapter-pg); migration 20260616200841_init applied; client generated to app/generated/prisma/.
- Feature 06: Project APIs — REST endpoints in app/api/projects/route.ts (GET lists owner's projects ordered by createdAt desc; POST creates project with default name "Untitled Project") and app/api/projects/[projectId]/route.ts (PATCH renames, DELETE deletes); 401 for unauthenticated, 403 for non-owner mutations; uses Clerk auth() and Prisma; no UI wiring.
- Feature 07: Wire Editor Home — editor/page.tsx converted to RSC; fetches owned projects (by userId) and shared projects (by email via ProjectCollaborator) server-side using lib/projects.ts helpers; EditorHomeClient client shell holds sidebar toggle state; useProjectActions hook manages all dialog state + API calls (create with client-generated room ID slug-suffix, rename with refresh, delete with redirect-or-refresh); project-sidebar and project-dialogs updated to use real SidebarProject type and wire handleCreate/handleRename/handleDelete; POST /api/projects accepts optional client-provided id for room ID alignment; mock-projects.ts and use-project-dialogs.ts removed.
- Feature 08: Editor Workspace Shell — lib/project-access.ts with getCurrentIdentity() (Clerk userId + primary email) and getProjectWithAccess() (owner or collaborator check); components/editor/access-denied.tsx (centered, lock icon, message, back link); app/editor/[roomId]/page.tsx RSC with auth redirect, access check, parallel data fetch, AccessDenied on missing/unauthorized; components/editor/editor-workspace-client.tsx client shell with sidebar toggle + AI sidebar toggle state, workspace navbar (project name center, share + AI toggle + UserButton right), ProjectSidebar with activeProjectId highlighting, canvas placeholder, AI sidebar slide-over placeholder; ProjectSidebar updated with optional activeProjectId prop to highlight current room.
- Feature 09: Share Dialog — app/api/projects/[projectId]/collaborators/route.ts (GET list with Clerk enrichment — name + imageUrl from getUserList; POST invite owner-only; DELETE remove owner-only; all with auth + ownership enforcement); components/editor/share-dialog.tsx (owner: invite input + remove-per-row + copy link with Copied! feedback; collaborator: read-only list; avatar with initial fallback); getProjectWithAccess now returns isOwner; EditorWorkspaceClient passes isOwner to ShareDialog and wires Share button to open it.

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
