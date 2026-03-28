---
name: claude-ui
description: Use when the user asks to fix, refine, or build UI in the current project. This skill delegates the implementation to Claude Code in the current checkout so the resulting Git diff appears naturally in the Codex app review pane.
---

When this skill is used:

1. Treat the user's exact request as the UI task to delegate.
2. Require the user to explicitly choose both a Claude model and a reasoning effort before running anything.
3. Use the invoking agent's user-input or selection tool to collect those choices when such a tool exists. If no such tool exists, ask the user directly. Do not silently choose defaults.
4. Do not add extra repository context unless it is necessary. Claude Code can inspect the repository itself.
5. Run the bundled helper script from this installed skill, outside the Codex sandbox, so Claude Code can use the user's existing local auth:
   - `bun run "$CODEX_HOME/skills/claude-ui/src/run-claude-ui.ts" --model "<model>" --effort "<effort>" -- "<user request>"`
   - If `CODEX_HOME` is unset, use `~/.codex/skills/claude-ui/src/run-claude-ui.ts`.
6. Wait for Claude Code to finish.
7. Inspect the resulting changes with:
   - `git status --short`
   - `git diff --stat`
8. Summarize what changed.
9. If no files changed, say so clearly.

Rules:

- The helper script must run in the current Codex workspace or worktree.
- Run the helper command with escalated permissions so it can access the user's normal Claude CLI login context.
- The skill must not run until both `--model` and `--effort` have been explicitly selected.
- Supported effort values are `low`, `medium`, `high`, and `max`.
- Use Bun, not npm, if you need to run package scripts or install dependencies.
- Do not try to convert Claude output into a fake Codex event format.
- Prefer direct in-place file edits so the Codex app can show the Git diff naturally.
- Keep the change minimal and focused on the user's request.
