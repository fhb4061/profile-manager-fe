---
description: Workflow for feature/bug work only. Not for architectural changes.
---

## Scope
- Applies: feature and bug work only
- Does NOT apply: architectural changes (stop and discuss with user first; no defined workflow yet)

## Process
1. Discuss & agree on seams before code using /grilling skill to gain a common understanding
2. Branch off master `<type>/<short-name>`
3. Implement via tdd skill (red -> green), commit per cycle
4. `npm test && npm run lint` after all implementations are done
5. Report back when all agreed seams are done
6. User pushes changes
7. Claude creates a PR (minimal description and straight to the point)
## Must
- check shadcn skill before native elements
## Must not
- push directly to master
- push on feature/bug branch, user will do it
- spin AWS resources
## Definitions
- done: means all agreed seams passed tests and committed