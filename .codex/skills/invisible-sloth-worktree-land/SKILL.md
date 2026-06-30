---
name: invisible-sloth-worktree-land
description: Land local invisible-sloth-website worktree branches after review and commit. Use when Codex needs to finish an invisible-sloth-website worktree workflow by rebasing the current worktree branch onto local main, optionally running the site validation checks, and then fast-forwarding local main to that branch without GitHub, remotes, pull requests, pushes, or cloud repository steps.
---

# Invisible Sloth Worktree Land

## Purpose

Use this skill to land a committed invisible-sloth-website worktree branch into local `main`.

This workflow is local-only:

1. Rebase the current worktree branch onto local `main`.
2. Validate the rebased site branch when requested or appropriate.
3. Fast-forward local `main` to the rebased branch.

Do not fetch, pull, push, open a pull request, use GitHub, or inspect remote branches unless the user explicitly changes the workflow.

## Required Preflight

Before changing refs:

- Confirm the current directory is inside the `invisible-sloth-website` repository.
- Confirm the current branch is not `main` and is not detached.
- Confirm the current worktree has no uncommitted or untracked changes.
- Confirm no Git operation is already in progress in the current worktree.
- Confirm local `main` exists.
- Discover the worktree that owns local `main`, if any, and confirm it is clean before fast-forwarding `main`.
- Confirm no Git operation is already in progress in the worktree that owns local `main`, if any.
- Confirm the user's changes are already committed on the worktree branch. Do not create a commit as part of this skill unless the user explicitly asks.

If any preflight fails, stop and report the exact blocker.

## Preferred Flow

Run a dry run first unless the user has already explicitly said to land the branch:

```bash
python3 .codex/skills/invisible-sloth-worktree-land/scripts/land_worktree.py --dry-run
```

Execute only when the user asked to land it or the dry run reports a clean, unambiguous path:

```bash
python3 .codex/skills/invisible-sloth-worktree-land/scripts/land_worktree.py --execute --validate
```

Use `--execute` without `--validate` only when validation was already completed in the rebased worktree or the user explicitly says to skip checks.

The script deliberately avoids network operations. It rebases the current branch onto local `main`, runs validation before updating `main` when `--validate` is passed, then advances local `main` only with a fast-forward update.

## Validation Policy

Before landing code changes, run:

```bash
npm run astro check
npm run build
```

Also run:

- `npm run build-storybook` for component, Storybook, design token, or component-doc changes.
- `npm run check:rich-text` for `RichTextBlock`, prose CSS, links CSS, Markdown, or prose-rendering changes.

Passing `--validate` lets the landing script run these checks after the rebase and before the `main` fast-forward. Passing `--all-validation` with `--validate` forces every project validation command. Without `--all-validation`, the script always runs `astro check` and `build`, then adds Storybook and rich-text checks based on changed paths.

If validation fails, do not fast-forward `main`. Report that the branch may already have been rebased and ask before aborting or rewriting history.

## No-Op Outcomes

Report these outcomes cleanly and do not change refs:

- Branch already equals `main`: nothing to land.
- Branch is already contained in `main`: nothing to land.
- Branch has no commits beyond `main` after rebase: nothing to land.

## Expected Outcomes

After a successful run:

- The current worktree branch is rebased onto local `main`.
- Local `main` points at the same commit as the current worktree branch.
- If `main` is checked out in another worktree, that worktree has been updated through `git merge --ff-only`.
- Worktree and branch cleanup remain out of scope. After successful landing, report that cleanup is now safe.

Report the branch name, previous `main` commit, branch commit before rebase, and final `main` commit. Also report validation commands that ran or explain why validation was skipped.

## Conflict Handling

If the rebase stops with conflicts:

- Do not fast-forward `main`.
- Tell the user that the branch is mid-rebase.
- Point them to `git status`.
- Continue only after the user resolves conflicts and asks to proceed, or asks to abort the rebase.

Do not run `git rebase --abort`, reset, or force-update refs unless the user explicitly asks.
Do not attempt to resolve conflicts automatically unless the user explicitly asks.
