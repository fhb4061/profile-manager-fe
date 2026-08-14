#!/bin/bash
# Create a seeded git worktree for feature/bug work.
#
#   .claude/scripts/worktree-new.sh <type>/<short-name>
#
# Worktree dir : worktree/<type>/<short-name>
# Branch       : <type>/<short-name>   (base: origin/master, or local master offline)
# Seeded with  : node_modules (APFS clone-copy) + .env.local (relative symlink)
#
# See .claude/rules/feature-bug-workflow.md

set -euo pipefail

REPO_ROOT=$(git rev-parse --show-toplevel)
cd "$REPO_ROOT"

BRANCH=${1:-}

if [ -z "$BRANCH" ]; then
  echo "usage: $0 <type>/<short-name>   e.g. fix/floating-video-bounds" >&2
  exit 1
fi

if [[ "$BRANCH" != */* ]] || [[ "$BRANCH" == */*/* ]] || [[ "$BRANCH" == */ ]] || [[ "$BRANCH" == /* ]]; then
  echo "error: expected exactly '<type>/<short-name>', got '$BRANCH'" >&2
  exit 1
fi

WT_DIR="worktree/$BRANCH"

if [ -e "$WT_DIR" ]; then
  echo "error: $WT_DIR already exists" >&2
  exit 1
fi

if git show-ref --verify --quiet "refs/heads/$BRANCH"; then
  echo "error: branch '$BRANCH' already exists" >&2
  exit 1
fi

# Base off origin/master so branches start from what GitHub actually has —
# PRs merge there, local master is only a cache of it.
BASE=origin/master
if git fetch origin master --quiet 2>/dev/null; then
  BASE=origin/master
else
  echo "warning: 'git fetch origin' failed (offline?) — basing on local master" >&2
  BASE=master
fi

git worktree add "$WT_DIR" -b "$BRANCH" "$BASE"

# node_modules: APFS copy-on-write clone. Near-instant, ~0 real disk until
# something writes to it, and independent of the main checkout's copy.
if [ -d node_modules ]; then
  cp -Rc node_modules "$WT_DIR/node_modules"
  echo "seeded: node_modules (clone-copy)"
else
  echo "warning: no node_modules to clone — run 'npm ci' in $WT_DIR" >&2
fi

# .env.local: machine config, identical everywhere, so share one file rather
# than snapshotting it. Depth is worktree/<type>/<name> -> repo root.
if [ -f .env.local ]; then
  ln -s ../../../.env.local "$WT_DIR/.env.local"
  echo "seeded: .env.local (symlink)"
else
  echo "warning: no .env.local — dev server won't authenticate" >&2
fi

echo
echo "worktree : $REPO_ROOT/$WT_DIR"
echo "branch   : $BRANCH (off $BASE)"
