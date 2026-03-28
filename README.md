# claude-ui-skill

A Bun-based Codex skill that delegates UI work to Claude Code.

## Files

- `skills/claude-ui/` - the installable skill
- `skills/claude-ui/src/run-claude-ui.ts` - the bundled helper script

## Local test

```bash
bun run claude-ui-skill -- "create a tiny hello world file"
```
