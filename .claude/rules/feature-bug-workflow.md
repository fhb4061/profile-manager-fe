---
description: Workflow for feature/bug work only. Not for architectural changes.
---

## Scope
- Applies: feature and bug work only
- Does NOT apply: architectural changes (stop and discuss with user first; no defined workflow yet)

## Standard path (default)
1. Discuss & agree on seams before code using /grilling skill to gain a common understanding
2. Branch off master `<type>/<short-name>`
3. Spin up tdd-implementer subagent with agreed seams to make the changes
4. `npm test && npm run lint` after all implementations are done
5. Report back when all agreed seams are done

## Trivial path
- Qualifies: single-file cosmetic tweak with no logic/behavior change (e.g. a CSS class); unsure = standard path
1. Branch off master `<type>/<short-name>`
2. Edit directly (no grilling, no subagent)
3. `npm test && npm run lint`
4. Report back

## Must
- check shadcn skill before native elements
## Must not
- push directly to master
- push on feature/bug branch, user will do it
- spin AWS resources
## Definitions
- done (standard): all agreed seams passed tests and committed
- done (trivial): change passed tests and committed