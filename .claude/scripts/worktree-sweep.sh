#!/bin/bash
# Remove worktrees under worktree/ whose branch is already merged into
# origin/master. Skips anything dirty or unmerged and says so.
#
#   .claude/scripts/worktree-sweep.sh [--dry-run]
#
# Safe by construction: only merged branches are deleted, always with
# 'git branch -d' (which refuses unmerged work), never -D.
#
# See .claude/rules/feature-bug-workflow.md

set -euo pipefail

REPO_ROOT=$(git rev-parse --show-toplevel)
cd "$REPO_ROOT"

DRY_RUN=0
if [ "${1:-}" = "--dry-run" ]; then
  DRY_RUN=1
elif [ -n "${1:-}" ]; then
  echo "usage: $0 [--dry-run]" >&2
  exit 1
fi

git fetch origin master --quiet 2>/dev/null || \
  echo "warning: 'git fetch origin' failed (offline?) — merge status may be stale" >&2

git worktree prune

MERGED=$(git branch --merged origin/master --format='%(refname:short)')

removed=0
skipped=0

while IFS= read -r wt; do
  case "$wt" in
    "$REPO_ROOT/worktree/"*) ;;
    *) continue ;;
  esac

  branch=$(git -C "$wt" branch --show-current 2>/dev/null || true)
  rel=${wt#"$REPO_ROOT"/}

  if [ -z "$branch" ]; then
    echo "skip   $rel — detached HEAD"
    skipped=$((skipped + 1))
    continue
  fi

  if ! grep -qxF "$branch" <<<"$MERGED"; then
    echo "skip   $rel — '$branch' not merged into origin/master"
    skipped=$((skipped + 1))
    continue
  fi

  if [ -n "$(git -C "$wt" status --porcelain)" ]; then
    echo "skip   $rel — uncommitted changes"
    skipped=$((skipped + 1))
    continue
  fi

  if [ "$DRY_RUN" = 1 ]; then
    echo "would remove  $rel (branch $branch)"
  else
    git worktree remove "$wt"
    git branch -d "$branch"
    echo "removed  $rel (branch $branch)"
  fi
  removed=$((removed + 1))
done < <(git worktree list --porcelain | awk '/^worktree /{print substr($0, 10)}')

if [ "$DRY_RUN" = 0 ]; then
  git worktree prune
  # Drop now-empty <type>/ dirs so worktree/ doesn't accumulate husks.
  [ -d worktree ] && find worktree -type d -empty -delete
fi

echo
echo "removed: $removed  skipped: $skipped"
