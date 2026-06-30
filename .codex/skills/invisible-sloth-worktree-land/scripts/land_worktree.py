#!/usr/bin/env python3
"""Land an invisible-sloth-website worktree branch into local main.

This script intentionally performs no network operations.
"""

from __future__ import annotations

import argparse
import json
import os
import subprocess
import sys
from dataclasses import dataclass
from pathlib import Path


class GitError(RuntimeError):
    def __init__(
        self,
        args: list[str],
        cwd: Path,
        returncode: int,
        stdout: str,
        stderr: str,
    ) -> None:
        self.args_list = args
        self.cwd = cwd
        self.returncode = returncode
        self.stdout = stdout
        self.stderr = stderr
        super().__init__(self._format())

    def _format(self) -> str:
        command = " ".join(["git", *self.args_list])
        details = [
            f"git command failed in {self.cwd}: {command}",
            f"exit code: {self.returncode}",
        ]
        if self.stdout.strip():
            details.append(f"stdout:\n{self.stdout.rstrip()}")
        if self.stderr.strip():
            details.append(f"stderr:\n{self.stderr.rstrip()}")
        return "\n".join(details)


@dataclass
class Worktree:
    path: Path
    branch_ref: str | None


@dataclass
class ValidationCommand:
    label: str
    command: list[str]


def git(args: list[str], cwd: Path, check: bool = True) -> subprocess.CompletedProcess[str]:
    result = subprocess.run(
        ["git", *args],
        cwd=cwd,
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        check=False,
    )
    if check and result.returncode != 0:
        raise GitError(args, cwd, result.returncode, result.stdout, result.stderr)
    return result


def git_stdout(args: list[str], cwd: Path, check: bool = True) -> str:
    return git(args, cwd, check=check).stdout.strip()


def resolve_git_path(repo: Path, git_path: str) -> Path:
    path = Path(git_path)
    if path.is_absolute():
        return path
    return (repo / path).resolve()


def git_dir(repo: Path) -> Path:
    return resolve_git_path(repo, git_stdout(["rev-parse", "--git-dir"], repo))


def require_no_operation_in_progress(path: Path, label: str) -> None:
    directory = git_dir(path)
    blockers = [
        directory / "rebase-merge",
        directory / "rebase-apply",
        directory / "MERGE_HEAD",
        directory / "CHERRY_PICK_HEAD",
        directory / "REVERT_HEAD",
    ]
    existing = [blocker.name for blocker in blockers if blocker.exists()]
    if existing:
        raise SystemExit(
            f"{label} already has a Git operation in progress ({', '.join(existing)}). "
            "Finish or abort it before landing."
        )


def is_ancestor(repo: Path, ancestor: str, descendant: str) -> bool:
    result = git(["merge-base", "--is-ancestor", ancestor, descendant], repo, check=False)
    if result.returncode == 0:
        return True
    if result.returncode == 1:
        return False
    raise GitError(
        ["merge-base", "--is-ancestor", ancestor, descendant],
        repo,
        result.returncode,
        result.stdout,
        result.stderr,
    )


def require_clean_worktree(path: Path, label: str) -> None:
    status = git_stdout(["status", "--porcelain=v1", "--untracked-files=normal"], path)
    if status:
        raise SystemExit(
            f"{label} has uncommitted or untracked changes. Commit, stash, or remove them first:\n"
            f"{status}"
        )


def parse_worktrees(repo: Path) -> list[Worktree]:
    output = git_stdout(["worktree", "list", "--porcelain"], repo)
    worktrees: list[Worktree] = []
    current_path: Path | None = None
    current_branch: str | None = None

    def flush() -> None:
        nonlocal current_path, current_branch
        if current_path is not None:
            worktrees.append(Worktree(path=current_path, branch_ref=current_branch))
        current_path = None
        current_branch = None

    for line in output.splitlines():
        if line.startswith("worktree "):
            flush()
            current_path = Path(line.removeprefix("worktree "))
        elif line.startswith("branch "):
            current_branch = line.removeprefix("branch ")
    flush()
    return worktrees


def find_main_worktree(repo: Path, main_branch: str) -> Path | None:
    branch_ref = f"refs/heads/{main_branch}"
    matches = [worktree.path for worktree in parse_worktrees(repo) if worktree.branch_ref == branch_ref]
    if len(matches) > 1:
        raise SystemExit(f"Found multiple worktrees for {main_branch}: {matches}")
    return matches[0] if matches else None


def require_invisible_sloth_repo(repo: Path) -> None:
    package_json = repo / "package.json"
    required_paths = [
        "package.json",
        "package-lock.json",
        "astro.config.mjs",
        "src/content.config.ts",
        "src/components/README.md",
        "src/styles/global.css",
        "src/styles/tokens",
        "src/pages",
        "src/stories",
        ".storybook/main.ts",
    ]
    missing = [name for name in required_paths if not (repo / name).exists()]
    if missing:
        raise SystemExit(
            f"{repo} does not look like the invisible-sloth-website repository. "
            f"Missing: {', '.join(missing)}"
        )

    try:
        package_data = json.loads(package_json.read_text(encoding="utf-8"))
    except json.JSONDecodeError as error:
        raise SystemExit(f"Cannot parse {package_json}: {error}") from error

    if package_data.get("name") != "invisible-sloth-website":
        raise SystemExit(
            f"{repo} does not look like the invisible-sloth-website repository. "
            f"package.json name is {package_data.get('name')!r}."
        )


def changed_files(repo: Path, main_branch: str) -> list[str]:
    output = git_stdout(["diff", "--name-only", f"{main_branch}...HEAD"], repo)
    return [line for line in output.splitlines() if line]


def should_run_storybook(paths: list[str]) -> bool:
    prefixes = (
        ".storybook/",
        "src/components/",
        "src/stories/",
        "src/styles/tokens/",
    )
    return any(path.startswith(prefixes) for path in paths)


def should_run_rich_text(paths: list[str]) -> bool:
    exact = {
        "src/components/RichTextBlock.svelte",
        "src/styles/rich-text.css",
        "src/styles/links.css",
    }
    suffixes = (".md", ".mdx")
    return any(path in exact or path.endswith(suffixes) for path in paths)


def validation_commands(paths: list[str], all_validation: bool) -> list[ValidationCommand]:
    commands = [
        ValidationCommand("Astro check", ["npm", "run", "astro", "check"]),
        ValidationCommand("Astro build", ["npm", "run", "build"]),
    ]
    if all_validation or should_run_storybook(paths):
        commands.append(ValidationCommand("Storybook build", ["npm", "run", "build-storybook"]))
    if all_validation or should_run_rich_text(paths):
        commands.append(ValidationCommand("Rich text contract", ["npm", "run", "check:rich-text"]))
    return commands


def run_validation(repo: Path, commands: list[ValidationCommand]) -> None:
    print("Validation commands:")
    for item in commands:
        print(f"- {item.label}: {' '.join(item.command)}")

    for item in commands:
        print(f"\nRunning {item.label}: {' '.join(item.command)}")
        result = subprocess.run(item.command, cwd=repo, check=False)
        if result.returncode != 0:
            raise SystemExit(
                f"Validation failed during {item.label}. "
                "Local main was not fast-forwarded."
            )


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            "Rebase the current invisible-sloth-website worktree branch onto local main "
            "and fast-forward main."
        )
    )
    mode = parser.add_mutually_exclusive_group()
    mode.add_argument("--execute", action="store_true", help="perform the rebase and main fast-forward")
    mode.add_argument("--dry-run", action="store_true", help="run preflight checks without changing refs")
    parser.add_argument("--main", default="main", help="local main branch name; defaults to main")
    parser.add_argument(
        "--repo",
        default=os.getcwd(),
        help="path inside the invisible-sloth-website worktree; defaults to the current directory",
    )
    parser.add_argument(
        "--validate",
        action="store_true",
        help="run project validation after rebase and before fast-forwarding main",
    )
    parser.add_argument(
        "--all-validation",
        action="store_true",
        help="with --validate, run Storybook and rich-text checks even when path detection would skip them",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    dry_run = not args.execute
    start_path = Path(args.repo).resolve()
    repo = Path(git_stdout(["rev-parse", "--show-toplevel"], start_path)).resolve()

    require_invisible_sloth_repo(repo)

    current_branch_result = git(["symbolic-ref", "--quiet", "--short", "HEAD"], repo, check=False)
    if current_branch_result.returncode != 0:
        raise SystemExit("Current worktree is detached. Check out the worktree branch first.")

    current_branch = current_branch_result.stdout.strip()
    if current_branch == args.main:
        raise SystemExit(f"Current branch is {args.main}. Run this from the worktree branch to land.")

    git_stdout(["rev-parse", "--verify", f"refs/heads/{args.main}"], repo)
    git_stdout(["rev-parse", "--verify", f"refs/heads/{current_branch}"], repo)

    require_clean_worktree(repo, f"Current worktree branch {current_branch}")
    require_no_operation_in_progress(repo, f"Current worktree branch {current_branch}")

    main_worktree = find_main_worktree(repo, args.main)
    if main_worktree is not None and main_worktree.resolve() != repo:
        main_label = f"Main worktree at {main_worktree}"
        require_clean_worktree(main_worktree, main_label)
        require_no_operation_in_progress(main_worktree, main_label)

    main_before = git_stdout(["rev-parse", args.main], repo)
    branch_before = git_stdout(["rev-parse", "HEAD"], repo)
    already_contains_main = is_ancestor(repo, args.main, "HEAD")
    branch_already_landed = is_ancestor(repo, "HEAD", args.main)
    paths_before_rebase = changed_files(repo, args.main)

    print(f"Repository: {repo}")
    print(f"Branch: {current_branch}")
    print(f"{args.main} before: {main_before}")
    print(f"branch before: {branch_before}")
    if main_worktree is not None:
        print(f"{args.main} worktree: {main_worktree}")
    else:
        print(f"{args.main} worktree: not checked out")
    if paths_before_rebase:
        print("Changed paths:")
        for path in paths_before_rebase:
            print(f"- {path}")
    else:
        print("Changed paths: none")

    if branch_before == main_before:
        print(f"No-op: {current_branch} already equals {args.main}; nothing to land.")
        return 0

    if branch_already_landed:
        print(f"No-op: {current_branch} is already contained in {args.main}; nothing to land.")
        return 0

    if dry_run:
        if already_contains_main:
            print("Dry run: preflight passed. The branch already contains local main.")
        else:
            print(f"Dry run: preflight passed. Execute mode will run: git rebase {args.main}")
        if args.validate:
            commands = validation_commands(paths_before_rebase, args.all_validation)
            print("Dry run: execute mode will run validation before fast-forwarding main:")
            for item in commands:
                print(f"- {item.label}: {' '.join(item.command)}")
        else:
            print("Dry run: validation skipped unless execute mode includes --validate.")
        print("Dry run: execute mode will fast-forward local main after a successful rebase.")
        return 0

    try:
        rebase = git(["rebase", args.main], repo)
        if rebase.stdout.strip():
            print(rebase.stdout.rstrip())
        if rebase.stderr.strip():
            print(rebase.stderr.rstrip(), file=sys.stderr)
    except GitError as error:
        print(str(error), file=sys.stderr)
        print(
            f"\nRebase stopped before {args.main} was updated. Resolve conflicts and run "
            "'git rebase --continue', or ask before aborting the rebase.",
            file=sys.stderr,
        )
        return error.returncode

    branch_after = git_stdout(["rev-parse", "HEAD"], repo)
    if branch_after == main_before:
        print(f"No-op: {current_branch} has no commits beyond {args.main} after rebase; nothing to land.")
        return 0

    if not is_ancestor(repo, args.main, "HEAD"):
        raise SystemExit(
            f"After rebase, {args.main} is not an ancestor of {current_branch}; "
            f"refusing to update {args.main}."
        )

    paths_after_rebase = changed_files(repo, args.main)
    if args.validate:
        run_validation(repo, validation_commands(paths_after_rebase, args.all_validation))
        require_clean_worktree(repo, f"Current worktree branch {current_branch} after validation")
    else:
        print("Validation skipped. Pass --validate to run project checks before landing.")

    if main_worktree is not None:
        merge = git(["merge", "--ff-only", current_branch], main_worktree)
        if merge.stdout.strip():
            print(merge.stdout.rstrip())
        if merge.stderr.strip():
            print(merge.stderr.rstrip(), file=sys.stderr)
    else:
        git(["update-ref", f"refs/heads/{args.main}", branch_after, main_before], repo)

    main_after = git_stdout(["rev-parse", args.main], repo)
    if main_after != branch_after:
        raise SystemExit(
            f"Expected {args.main} to point at {branch_after}, but it points at {main_after}."
        )

    print(f"branch after: {branch_after}")
    print(f"{args.main} after: {main_after}")
    print("Done: local main fast-forwarded to the worktree branch.")
    print("Worktree cleanup is now safe and remains a separate operation.")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except GitError as error:
        print(str(error), file=sys.stderr)
        raise SystemExit(error.returncode)
