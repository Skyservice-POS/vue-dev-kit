#!/usr/bin/env bash
# Формує нотатки релізу з історії conventional-комітів від попереднього тега.
#
# Чому не gh --generate-notes: він збирає "What's Changed" із замерджених
# пул-реквестів, а в цьому репо робота здебільшого їде прямими пушами в main
# (14 мерджів на 142 коміти) — нотатки виходили б порожні.
#
# Використання: release-notes.sh <version-without-v> > notes.md
set -euo pipefail

VERSION="$1"
REPO="${GITHUB_REPOSITORY:-Skyservice-POS/vue-dev-kit}"

# Тег цієї версії ще не існує (його створює gh release create), тож найближчий
# досяжний тег — це попередній реліз.
PREV="$(git describe --tags --abbrev=0 2>/dev/null || true)"
RANGE="${PREV:+$PREV..}HEAD"

commits() { git log --no-merges --pretty=format:'%s%x09%h' "$RANGE"; }

section() {
  # section <заголовок> <regex типів>
  local title="$1" types="$2" body
  body="$(commits \
    | { grep -E "^($types)(\([^)]*\))?!?:" || true; } \
    | sed -E 's/^[a-z]+(\(([^)]*)\))?!?: */\2\t/' \
    | awk -F'\t' '{ scope = $1; msg = $2; hash = $3;
        if (scope != "") printf "- **%s**: %s (`%s`)\n", scope, msg, hash;
        else printf "- %s (`%s`)\n", msg, hash }')"
  if [ -n "$body" ]; then
    printf '### %s\n\n%s\n\n' "$title" "$body"
  fi
  return 0
}

breaking="$(commits | { grep -E '^[a-z]+(\([^)]*\))?!:' || true; } | sed -E 's/^/- /')"
if [ -n "$breaking" ]; then
  printf '### ⚠️ Breaking changes\n\n%s\n\n' "$breaking"
fi

section "✨ Нове" "feat"
section "🐛 Виправлення" "fix"
section "⚡ Продуктивність" "perf"
section "📖 Документація" "docs"
section "🔧 Під капотом" "refactor|chore|ci|build|style|test"

if [ -n "$PREV" ]; then
  printf '**Повний список змін**: https://github.com/%s/compare/%s...v%s\n' \
    "$REPO" "$PREV" "$VERSION"
fi

printf '\n📦 npm: `npm i @skyservice-developers/vue-dev-kit@%s`\n' "$VERSION"
