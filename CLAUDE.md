# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Profile Manager frontend: view/list profiles, edit only your own profile details/picture.

## Commands

```
npm run dev              # dev server
npm run build             # tsc -b + vite build
npm run lint               # eslint .
npm test                   # vitest (watch)
npx vitest run <file>      # run one test file
```

## Architecture

- Routes defined in `src/App.tsx` (`/login`, `/callback`, `/silent-renew`, `/`); pages in `src/pages/`.
- `src/components/ui/` = shadcn primitives (`components.json`, style `base-mira`) — add new ones via shadcn conventions.
- **Before writing any custom or native UI element** (`<button>`, `<input>`, `<label>`, etc.) in `src/pages/` or `src/components/`, invoke the `shadcn` skill to check whether a suitable component already exists — locally in `src/components/ui/` or available in the registry — before building one by hand.
- `src/lib/` = framework-agnostic helpers (`utils.ts`, `auth.ts`, `profiles.ts`).
- `@/*` path alias → `src/*`.
- Tailwind v4 via `@tailwindcss/vite`, configured in `src/index.css` (no `tailwind.config`).
- Auth via Cognito Hosted UI (`react-oidc-context`) — see `src/lib/auth.ts`, `src/components/ProtectedLayout.tsx`.
- No backend yet — profile data is mocked in `src/lib/profiles.ts`.

Tests sit beside source (`*.test.ts(x)`), Vitest + Testing Library, jsdom.
