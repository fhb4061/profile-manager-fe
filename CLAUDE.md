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

- Routes defined in `src/App.tsx`; pages in `src/pages/`.
- `src/components/ui/` = shadcn primitives (`components.json`, style `base-mira`) — add new ones via shadcn conventions.
- **Before writing any custom or native UI element** (`<button>`, `<input>`, `<label>`, etc.) in `src/pages/` or `src/components/`, invoke the `shadcn` skill to check whether a suitable component already exists — locally in `src/components/ui/` or available in the registry — before building one by hand.
- `src/lib/` = framework-agnostic helpers.
- `@/*` path alias → `src/*`.
- Tailwind v4 via `@tailwindcss/vite`, configured in `src/index.css` (no `tailwind.config`).
- Auth via Cognito Hosted UI (`react-oidc-context`) — see `src/lib/auth.ts`, `src/components/ProtectedLayout.tsx`.
- Backend is a real API (`VITE_API_BASE_URL`) — see `src/lib/api.ts` for the axios client and Cognito bearer-token attachment.

Tests sit beside source (`*.test.ts(x)`), Vitest + Testing Library, jsdom.

## Workflow

- Always implement via the `tdd` skill (red → green), even for small changes — don't skip straight to writing code.
- For test-first implementation work, `tdd-implementer` (`.claude/agents/`) can be delegated to — manual invocation only, and it expects seams already agreed with the user before it starts; it won't guess or ask on its own.
- Before invoking `tdd-implementer`, paste the exact formatted handoff prompt into the conversation so the user can verify it matches what was agreed, then invoke.
- When given a numbered plan and asked to execute it one-by-one, keep the exact numbering given — don't merge, split, or renumber steps. If two steps seem too coupled to do independently, say so and ask before combining.
