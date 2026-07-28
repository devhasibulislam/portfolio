---
mode: agent
description: "Report exactly where the build left off and what to do next."
---

Read [`docs/BUILD_PLAN.md`](../../docs/BUILD_PLAN.md) end-to-end, then report:

1. **Which phase we're in** (0–5) and one-sentence status.
2. **The last commit** on `origin/master` (short SHA + subject line) — check with `git log -1 --oneline origin/master` if unsure.
3. **The next actionable checkbox** in the current phase — quote it verbatim.
4. **Any provisioning steps still open** (from the "Provisioning still to do" block).
5. **Deferred TODOs from earlier phases** that could quietly bite us if we skip them.

Keep it tight — a numbered list, no preamble. If Phase status conflicts with what's actually in the repo (e.g. checkbox says done but the file doesn't exist), flag the drift explicitly.
