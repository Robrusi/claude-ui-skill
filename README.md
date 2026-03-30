# claude-skill

`claude-ui` is a skill that hands UI work off to Claude Code, then leaves the resulting file edits in the current git checkout

## What It Does

- requires an explicit Claude model and reasoning effort
- checks that you are inside a git repository
- verifies that the `claude` CLI is installed and authenticated
- runs Claude Code against the current working tree
- prints a short git summary after Claude finishes

This is mainly useful when you want Codex to stay as the orchestrator, but you want Claude Code to implement the actual UI change in-place.

## Repository Layout

- `skills/claude-ui/SKILL.md` - Codex skill instructions
- `skills/claude-ui/src/run-claude-ui.ts` - Bun helper that invokes Claude Code

## What The Helper Enforces

- `--model` is required
- `--effort` is required
- the command must run inside a git repository
- `claude --version` must succeed
- `claude auth status` must report a logged-in session

If any of those checks fail, the helper exits early with a clear error message.

##  Notes

- The helper runs Claude with a limited allowed tool set and `acceptEdits` permission mode.
- After completion, it prints `git status --short`, changed files, untracked files, and `git diff --stat`.
