# Login Page — PRD

## Overview
A login page with email and password fields. No backend — clicking Login navigates directly to a static page once both fields pass validation.

## Decisions

1. **Routing:** `react-router-dom`. Routes: `/login` (login page), `/` (static post-login page).
   - `/` is root so that a future auth guard can redirect unauthenticated visits to `/login`.
2. **Email validation:** HTML5 `type="email"` pattern-based check (basic shape, not stricter).
3. **Password validation:** Minimum 8 characters, no complexity rules.
4. **Validation timing:** On blur — error shows after the user leaves the field.
5. **Login button:** Disabled until both fields pass validation. On click, always navigates to `/` — no fake credential check (no backend).
6. **Persistence:** None. No localStorage/session flag, no route guarding (yet).
7. **Static page (`/`):** Minimal placeholder — "Welcome" heading, proves the route works.
8. **UI components:** shadcn (`input`, `label`, `button`), consistent with the rest of the repo.
9. **Form state:** Plain `useState`, no react-hook-form/zod (two fields, simple rules).

## Implementation Notes

- `src/lib/validation.ts` — `isValidEmail`, `isValidPassword` (pure functions, unit tested)
- `src/pages/Login.tsx` — login form
- `src/pages/Home.tsx` — static placeholder page
- Test stack added: Vitest + @testing-library/react + jsdom (`npm test`)
- Path alias `@/*` → `src/*` configured in `vite.config.ts` and `tsconfig.app.json`

## Out of scope (for now)
- Real authentication / credential checking
- Persisted login state / protected routes
- Password complexity rules beyond length
