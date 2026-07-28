---
mode: agent
description: "Grep for banned physical CSS/Tailwind properties that violate the RTL policy."
---

Enforce [`.github/instructions/rtl-logical-props.instructions.md`](../instructions/rtl-logical-props.instructions.md) across the codebase.

## Steps

1. Grep `src/**/*.{ts,tsx,css}` for banned patterns. Search all of these in one pass (regex, case-insensitive):
   - Tailwind class utilities: `\b(ml|mr|pl|pr|left|right|border-l|border-r|rounded-l|rounded-r|text-left|text-right)-\S+`
   - CSS properties: `\b(margin-left|margin-right|padding-left|padding-right|border-left|border-right)\b`
2. **Ignore** these paths (they're allowed):
   - `.next/**`, `node_modules/**`, `dist/**`, `build/**`
   - `.agents/**` (installed skill docs, not our code)
   - Any line already wrapped in an `rtl:` variant on the same class list, e.g. `left-4 rtl:right-4` — that's the documented escape hatch.
3. Report violations grouped by file with `file:line` and the offending class/property. If zero violations, say so and stop.
4. Do **not** auto-fix. This prompt only reports — the human decides whether to swap to `ms-`/`me-`/`start-`/`end-` or keep the explicit `rtl:` pair.
