---
description: Workflow for feature/bug work only. Not for architectural changes.
---

## Scope
- Applies: feature and bug work only
- Does NOT apply: architectural changes (stop and discuss with user first; no defined workflow yet)
- Trivial exception: single-file cosmetic tweak with no logic/behavior change (e.g. a CSS class) may skip steps 1 AND 3; edit directly, run `npm test && npm run lint`, report; commit only if user asks

## Process
1. Discuss & agree on seams before code using /grilling skill to gain a common understanding
2. Branch off master `<type>/<short-name>`
3. Spin up tdd-implementer subagent with agreed seams to make the changes
4. `npm test && npm run lint` after all implementations are done
5. Report back when all agreed seams are done
## Must
- check shadcn skill before native elements
## Must not
- push directly to master
- push on feature/bug branch, user will do it
- spin AWS resources
## Definitions
- done: means all agreed seams passed tests and committed