# Progress Tracker

Update this file whenever the current phase, active feature, or implementation state changes.

## Current Phase
- Feature 03: Auth

## Current Goal
- Wire Clerk into the Next.js app: provider, auth pages, redirects, route protection, and user menu.

## Completed

- Feature 01: Design System — shadcn/ui configured, 7 UI components added (Button, Card, Dialog, Input, Tabs, Textarea, ScrollArea), lucide-react installed, globals.css dark theme tokens set up with @theme inline Tailwind v4 mappings, lib/utils.ts cn() helper created.
- Feature 02: Editor Shell — EditorNavbar (fixed top bar, sidebar toggle with PanelLeftOpen/PanelLeftClose, left/center/right layout) and ProjectSidebar (floating overlay, slide-in from left, Projects title + X close, My Projects/Shared tabs with empty states, New Project button) created in components/editor/.
- Feature 03: Auth — @clerk/ui installed; Clerk env vars added (SIGN_IN_URL, SIGN_UP_URL, AFTER_SIGN_IN_URL, AFTER_SIGN_UP_URL); proxy.ts at project root wraps clerkMiddleware with createRouteMatcher to protect all routes except /sign-in and /sign-up; ClerkProvider wraps root layout using dark theme from @clerk/ui/themes with CSS variable overrides (no hardcoded colors); sign-in and sign-up pages use two-panel layout (info panel left on lg+, Clerk form right); app/page.tsx redirects authenticated users to /editor and unauthenticated users to /sign-in; UserButton added to EditorNavbar right section; minimal app/editor/page.tsx shell created with EditorNavbar and ProjectSidebar.

## In Progress

- None.

## Next Up
- Add the next planned feature unit here.

## Open Questions

- Add unresolved product or implementation questions here.

## Architecture Decisions

- Next.js 16 uses proxy.ts (renamed from middleware.ts) with export function proxy(). clerkMiddleware returns NextMiddleware which is compatible with NextProxy.

## Session Notes

- Add context needed to resume work in the next session.
