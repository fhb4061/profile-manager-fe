# Project purpose

`profile-manager-fe` is an experimental project that is used to integrate with AWS. This project allows users to sign up, login, view list of profiles, and edit only their own profile.

# Technical Stack
- Runtime: React 19 + Typescript + Vite
- Package manager: npm
- Routing: react-router v8
- Server state: TanStack Query
- Component library: shadcn (use /shadcn skill) — style `base-mira`, built on Base UI, NOT Radix: no `asChild`, use `render` prop (see AppShell.tsx)
- Testing: Vitest

# Commands
```bash
npm run dev             # Run dev server
npm run build           # Build production version of application
npm run preview         # Previews the production version of the app (must run 'npm run build' first before this)
npm test                # Runs test
npm run test:watch      # Runs test in watch mode and never exits
npm run lint            # Runs linting
npm run verify          # Full sweep: lint + build + test. Canonical pre-report check
```

# Must
- check the `shadcn` skill before writing any native element (`<button>`, `<input>`, `<select>`, etc.) in `src/pages/` or `src/components/`

# Must not
- start the dev server or open a browser to verify UI/frontend changes — user verifies visually themselves

# Architecture
The codebase follows a modular architecture with clear separation of concerns:

## Directories
```
src/
├── components/ui/         # contains ONLY shadcn reusable components
├── components/            # contains ONLY custom hand-written components
├── hooks/                 # contains ONLY reusable hooks
├── lib/                   # contains ONLY helpers or util like functions only
├── models/                # contains ONLY types for API responses
├── pages/                 # contains ONLY pages for this project
├── test/                  # contains ONLY test related setups
```

## Concepts

### Env setup
- copy .env.example to .env.local with 5 VITE_COGNITO_* vars + VITE_API_BASE_URL
- App won't run meaningfully without these
### Auth
- Cognito Hosted UI via react-oidc-context
- Anyone touching pages needs to know about src/lib/auth.ts, ProtectedLayout.tsx, silent renew (/silent-renew route, authRecovery.ts)
### API Client
- src/lib/api.ts axios with bearer access-token interceptor + 401 silent-renew-and-retry logic
- not obvious, easy to break
### Path alias
- @/* = src/*
### Tailwind v4
- via @tailwindcss/vite
- configured in src/index.css
- NO tailwind.config
### Routing
- routes in src/App.tsx
- pages lazy-loaded
### Test conventions
- test sit beside source with *.test.{ts|tsx} extension
- jsdom + Testing Library setup in src/test/setup.ts