---
name: claude-ui
description: Use when the user asks to fix, refine, or build UI in the current project. This skill delegates the implementation to Claude Code in the current checkout so the resulting Git diff appears naturally in the Codex app review pane.
---

When this skill is used:

1. Treat the user's exact request as the UI task to delegate.
2. Require the user to explicitly choose both a Claude model and a reasoning effort before running anything.
3. Use the invoking agent's structured user-input or selection tool to collect those choices when that tool exists in the current harness or mode.
4. Do not ask for model or effort in plain text if the structured tool is available. USE YOUR USER INPUT TOOL TO ASK FOR THE MODEL AND EFFORT!
5. If the structured tool is unavailable, ask the user directly in plain text and do not proceed until both values are provided.
6. Do not add extra repository context unless it is necessary. Claude Code can inspect the repository itself.
7. Run the bundled helper script outside the Codex sandbox so Claude Code can use the user's existing local auth:
   - `bun run .agents/skills/claude-ui/src/run-claude-ui.ts --model "<model>" --effort "<effort>" -- "<user request>"`
8. Wait for Claude Code to finish.
9. Inspect the resulting changes with:
   - `git status --short`
   - `git diff --stat`
10. Summarize what changed.
11. If no files changed, say so clearly.

Rules:

- The helper script must run in the current Codex workspace or worktree.
- Run the helper command with escalated permissions so it can access the user's normal Claude CLI login context.
- The skill must not run until both `--model` and `--effort` have been explicitly selected.
- Prefer the harness selection/input tool over plain-text questioning whenever that tool is available.
- Supported effort values are `low`, `medium`, `high`, and `max`.
- Use Bun, not npm, if you need to run package scripts or install dependencies.
- Do not try to convert Claude output into a fake Codex event format.
- Prefer direct in-place file edits so the Codex app can show the Git diff naturally.
- Keep the change minimal and focused on the user's request.
