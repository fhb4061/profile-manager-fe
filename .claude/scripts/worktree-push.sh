#!/bin/bash
# Push a feature/bug worktree branch to origin and open a PR.
#
#   .claude/scripts/worktree-push.sh <type>/<short-name> [--title <t>] [--body-file <f>]
#
# Worktree dir : .claude/worktrees/<type>/<short-name>
# Branch       : <type>/<short-name>
#
# --title/--body-file : used as-is for the PR (Claude-authored case).
# neither given        : falls back to `gh pr create --fill` (manual-run case).
#
# Never force-pushes. Refuses on a dirty worktree or zero commits ahead of
# origin/master. Skips PR creation (and prints the URL) if one already exists.
# PR is opened ready (not draft), base master.
#
# See .claude/rules/feature-bug-workflow.md

set -euo pipefail

REPO_ROOT=$(git rev-parse --show-toplevel)
cd "$REPO_ROOT"

BRANCH=${1:-}
if [ -z "$BRANCH" ] || [[ "$BRANCH" == --* ]]; then
  echo "usage: $0 <type>/<short-name> [--title <t>] [--body-file <f>]" >&2
  exit 1
fi
shift

TITLE=""
BODY_FILE=""
while [ $# -gt 0 ]; do
  case "$1" in
    --title) TITLE=${2:-}; shift 2 ;;
    --body-file) BODY_FILE=${2:-}; shift 2 ;;
    *) echo "error: unknown arg '$1'" >&2; exit 1 ;;
  esac
done

if [[ "$BRANCH" != */* ]] || [[ "$BRANCH" == */*/* ]] || [[ "$BRANCH" == */ ]] || [[ "$BRANCH" == /* ]]; then
  echo "error: expected exactly '<type>/<short-name>', got '$BRANCH'" >&2
  exit 1
fi

WT_DIR=".claude/worktrees/$BRANCH"

if [ ! -d "$WT_DIR" ]; then
  echo "error: no worktree at $WT_DIR" >&2
  exit 1
fi

if [ -n "$(git -C "$WT_DIR" status --porcelain)" ]; then
  echo "error: $WT_DIR has uncommitted or untracked changes — commit or discard first" >&2
  exit 1
fi

git -C "$WT_DIR" fetch origin master --quiet
AHEAD=$(git -C "$WT_DIR" rev-list --count origin/master..HEAD)
if [ "$AHEAD" -eq 0 ]; then
  echo "error: '$BRANCH' has no commits ahead of origin/master — nothing to push" >&2
  exit 1
fi

git -C "$WT_DIR" push -u origin "$BRANCH"

EXISTING_PR=$(gh pr view "$BRANCH" --json url --jq .url 2>/dev/null || true)
if [ -n "$EXISTING_PR" ]; then
  echo "PR already open: $EXISTING_PR"
  exit 0
fi

PR_ARGS=(--base master --head "$BRANCH")
if [ -n "$TITLE" ]; then
  PR_ARGS+=(--title "$TITLE")
fi
if [ -n "$BODY_FILE" ]; then
  PR_ARGS+=(--body-file "$BODY_FILE")
fi
if [ -z "$TITLE" ] && [ -z "$BODY_FILE" ]; then
  PR_ARGS+=(--fill)
fi

gh pr create "${PR_ARGS[@]}"
