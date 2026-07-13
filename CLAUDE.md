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

- Routes defined in `src/App.tsx` (`/login`, `/`); pages in `src/pages/`.
- `src/components/ui/` = shadcn primitives (`components.json`, style `base-mira`) — add new ones via shadcn conventions.
- `src/lib/` = framework-agnostic helpers (`validation.ts`, `utils.ts`).
- `@/*` path alias → `src/*`.
- Tailwind v4 via `@tailwindcss/vite`, configured in `src/index.css` (no `tailwind.config`).
- No backend yet — flows like `Login`'s submit are stubbed.

Tests sit beside source (`*.test.ts(x)`), Vitest + Testing Library, jsdom.
