#!/usr/bin/env sh
# Blocks any commit that stages a file matching common secret patterns.
# No external deps — just POSIX grep + git. Extend PATTERNS for your own
# secret shapes.
#
# Overridable in an emergency: `git commit --no-verify` (don't).

set -eu

# Only inspect files that are actually being added/modified in this commit.
FILES=$(git diff --cached --name-only --diff-filter=ACM)
[ -z "$FILES" ] && exit 0

# Absolute exclusions — these are the only places secret-shaped strings are
# ever allowed to appear (placeholders or the scanner's own patterns).
EXCLUDE_RE='^(\.env\.example|scripts/scan-secrets\.sh|\.husky/pre-commit)$'

# One regex per line.
PATTERNS='postgresql://[^" '"'"' ]*:[^" '"'"' ]*@
npg_[A-Za-z0-9]{20,}
napi_[A-Za-z0-9]{40,}
vcp_[A-Za-z0-9]{20,}
AIza[A-Za-z0-9_-]{35}
sk-[A-Za-z0-9]{32,}
AKIA[0-9A-Z]{16}
-----BEGIN [A-Z ]*PRIVATE KEY-----'

SENTINEL="/tmp/.secret-scan-hit.$$"
trap 'rm -f "$SENTINEL"' EXIT

for f in $FILES; do
    echo "$f" | grep -Eq "$EXCLUDE_RE" && continue
    ADDED=$(git diff --cached --unified=0 -- "$f" | grep -E '^\+[^+]' || true)
    [ -z "$ADDED" ] && continue
    printf '%s\n' "$PATTERNS" | while IFS= read -r pat; do
        [ -z "$pat" ] && continue
        if echo "$ADDED" | grep -Eq -e "$pat"; then
            printf '\033[31m[secret-scan] BLOCKED: potential secret in %s\033[0m\n' "$f" >&2
            printf '  pattern: %s\n' "$pat" >&2
            touch "$SENTINEL"
        fi
    done
done

if [ -f "$SENTINEL" ]; then
    echo "" >&2
    echo "Commit refused. If this is a false positive, edit .husky/pre-commit" >&2
    echo "and add the file to EXCLUDE_RE. Never commit real secrets." >&2
    exit 1
fi
