---
description: Workflow for feature/bug work only. Not for architectural changes.
---

## Scope
- Applies: feature and bug work only
- Does NOT apply: architectural changes (stop and discuss with user first; no defined workflow yet)

## Path gate
Trivial if BOTH:
1. no test would meaningfully change (no red→green test could be written)
2. no un-verifiable behaviour risk — existing checks (test/lint/typecheck) prove nothing broke

Appearance is out of scope for 2 — user is the oracle for purely visual change.
Unsure = standard. No size or file-count cap.
Announce classification in one line, then proceed (do not wait for ack).
If it turns out non-trivial mid-flight: keep branch, revert exploratory edits, re-grill, hand to tdd-implementer.

## Standard path (default)
1. Discuss & agree on seams before code using /grilling skill to gain a common understanding. Applies every round a design/seam gets discussed, not just the first pass on a new feature — a follow-up fix to already-agreed work still needs this. End with a consolidated summary of the full agreed design and an explicit go-ahead before moving to step 3; answering individual clarifying questions in isolation does not substitute for this.
2. Branch off master `<type>/<short-name>`
3. Spin up tdd-implementer subagent with agreed seams to make the changes
4. `npm run verify` after all implementations are done — verifies the agent's green claim, don't take it on trust
5. Report back when all agreed seams are done

## Trivial path
1. Branch off master `<type>/<short-name>`
2. Edit directly (no grilling, no subagent)
3. `npm run verify`
4. Report back

## Must
- flag any deviation from what was agreed/asked as its own explicit callout when reporting back — what was agreed, what was built instead, and why — not folded into the general summary
## Must not
- push directly to master
- push on feature/bug branch, user will do it
- spin AWS resources
## Definitions
- done (standard): all agreed seams passed tests and committed
- done (trivial): existing checks green and committed