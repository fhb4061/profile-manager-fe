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
If it turns out non-trivial mid-flight: stay in the worktree, revert exploratory edits there, re-grill, hand to tdd-implementer.

## Worktrees
Both paths run in a git worktree. The main checkout never leaves `master` — that is the point, so a bad run can never dirty what the user is looking at.

Step "enter a worktree" means, exactly:
1. `.claude/scripts/worktree-new.sh <type>/<short-name>` — creates `.claude/worktree/<type>/<short-name>` on branch `<type>/<short-name>` off `origin/master`, seeded with `node_modules` + `.env.local`
2. `EnterWorktree` with the `path:` it printed

Then work there. tdd-implementer inherits the cwd — pass it the worktree path as its repo line, nothing else about worktrees concerns it.

- do NOT use `EnterWorktree` with `name:` — it mangles `/` to `+` and prefixes branches with `worktree-`
- deps changed during the task (`package.json`/lockfile), or verify fails on module resolution → `npm ci` in the worktree; its `node_modules` is a clone of master's
- at task end, `EnterWorktree` back to the main checkout on `master`. Leave the worktree and branch on disk — the user pushes them
- removal is never automatic: `.claude/scripts/worktree-sweep.sh` clears worktrees whose branch is merged into `origin/master`. Run it only when asked

## Standard path (default)
1. Discuss & agree on seams before code using /grilling skill to gain a common understanding. Applies every round a design/seam gets discussed, not just the first pass on a new feature — a follow-up fix to already-agreed work still needs this. End with a consolidated summary of the full agreed design and an explicit go-ahead before moving to step 3; answering individual clarifying questions in isolation does not substitute for this.
2. Enter a worktree (see above)
3. Spin up tdd-implementer subagent with agreed seams to make the changes
4. `npm run verify` after all implementations are done — verifies the agent's green claim, don't take it on trust
5. Return to the main checkout, then report back when all agreed seams are done

## Trivial path
1. Enter a worktree (see above)
2. Edit directly (no grilling, no subagent)
3. `npm run verify`
4. Return to the main checkout, then report back

## Must
- flag any deviation from what was agreed/asked as its own explicit callout when reporting back — what was agreed, what was built instead, and why — not folded into the general summary
## Must not
- push directly to master
- push on feature/bug branch, user will do it
- spin AWS resources
## Definitions
- done (standard): all agreed seams passed tests and committed
- done (trivial): existing checks green and committed