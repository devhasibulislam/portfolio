---
mode: agent
description: "Audit .agents/skills/, .github/instructions/, and .github/prompts/ against AGENTS.md for drift."
---

Compare what exists on disk against what [`.github/copilot-instructions.md`](../copilot-instructions.md) (aka `AGENTS.md` / `CLAUDE.md`) references. Report drift so it can be fixed in one commit.

## Steps

1. **Inventory disk** — run these three shell commands and capture the output:

   ```bash
   ls -1 .agents/skills/ 2>/dev/null | sort
   ls -1 .github/instructions/ 2>/dev/null | grep '\.instructions\.md$' | sort
   ls -1 .github/prompts/ 2>/dev/null | grep '\.prompt\.md$' | sort
   ```

2. **Inventory references** — grep `.github/copilot-instructions.md` for each item:

   - **Skills**: every top-level folder name in `.agents/skills/` must appear at least once in the skill map table, either as a used skill or explicitly marked out of scope (like `claimable-postgres`).
   - **Instructions**: every `*.instructions.md` file must be mentioned by filename in the top-level file (they auto-load for Copilot via `applyTo`, but need to be documented for humans + non-Copilot agents).
   - **Prompts**: every `*.prompt.md` file must appear in the "Slash prompts" section with `/name` and a one-line description.

3. **Report drift** — output exactly this table structure. Do NOT preamble. Do NOT recommend fixes yet — just report:

   ```
   | Kind         | File                                    | In AGENTS.md? |
   | ------------ | --------------------------------------- | ------------- |
   | skill        | .agents/skills/<name>/                  | ✅ / ❌       |
   | instruction  | .github/instructions/<name>.md          | ✅ / ❌       |
   | prompt       | .github/prompts/<name>.md               | ✅ / ❌       |
   ```

   Only include rows where the answer is ❌. If everything is ✅, say `"No drift detected — AGENTS.md is in sync with disk."` and stop.

4. **After the drift table**, offer to fix in the next turn. Do NOT auto-edit files. The human confirms which fixes to apply.

## When to run this prompt

- End of each phase (0 → 1 → 2 …) as a checklist item
- After any `npx skills add` invocation (adds new skills to `.agents/skills/`)
- After creating any new `.github/instructions/*.instructions.md` or `.github/prompts/*.prompt.md`
- Any time AGENTS.md feels stale
