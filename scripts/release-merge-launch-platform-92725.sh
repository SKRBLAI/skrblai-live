#!/usr/bin/env bash
set -euo pipefail

echo "== SKRBL AI :: Release merge for launch-platform-92725 =="

# -----------------------------
# 0) sanity + ignore env files
# -----------------------------
git rev-parse --is-inside-work-tree >/dev/null 2>&1 || { echo "Not a git repo"; exit 1; }

if ! grep -qE '^\s*\.env' .gitignore 2>/dev/null; then
  echo ".env.local" >> .gitignore
  echo ".env.*" >> .gitignore
fi

# Snapshot local edits (without envs)
if ! git diff --quiet || ! git diff --cached --quiet; then
  echo "WIP: committing local changes (excluding env and build artifacts)…"
  git add -A
  # Unstage any .env or build dirs if accidentally added
  git reset -- .env .env.* 2>/dev/null || true
  git reset -- .next node_modules dist out 2>/dev/null || true
  git commit -m "chore: wip before release merge"
fi

# -----------------------------
# 1) create release branch
# -----------------------------
echo "Checking out master and syncing…"
git checkout master
git pull --rebase

REL_BRANCH="chore/launch-platform-92725"
if git rev-parse --verify "$REL_BRANCH" >/dev/null 2>&1; then
  echo "Release branch already exists; checking it out…"
  git checkout "$REL_BRANCH"
  git rebase master
else
  echo "Creating $REL_BRANCH from master…"
  git checkout -b "$REL_BRANCH"
fi

# -----------------------------
# 2) branches to merge (in order)
# -----------------------------
MERGE_ORDER=(
  "hotfix/agent-images-webp-then-nobg"
  "hotfix/stripe-auth-guard"
  "feature/agent-league-orbit"
  "chore/audit-site-map-and-env-inventory"
)

# files we always prefer from the merging branch ("theirs")
PREFER_THEIRS=(
  # unified image system
  "utils/agentImages.ts"
  "components/shared/AgentImage.tsx"
  "components/home/AgentLeaguePreview.tsx"
  "components/ui/AgentLeagueCard.tsx"
  "components/agents/AgentLeagueDashboard.tsx"
  "components/sports/UnifiedSportsHero.tsx"

  # orbit experience - CORRECTED PATHS
  "components/agents/AgentLeagueOrbit.tsx"
  "components/agents/AgentOrbitCard.tsx"
  "components/agents/AgentBackstoryModal.tsx"

  # feature flags + homepage variant
  "lib/config/featureFlags.ts"
  "app/page.tsx"

  # auth compact UI + captcha + diagnostics
  "app/(auth)/sign-in/page.tsx"
  "app/(auth)/sign-up/page.tsx"
  "app/api/recaptcha/verify/route.ts"
  "app/api/env-check/route.ts"

  # stripe resilience
  "lib/env/readEnvAny.ts"
  "app/api/checkout/route.ts"
  "components/pricing/BuyButton.tsx"

  # ARR telemetry (flag-gated)
  "lib/analytics/arr.ts"
  "app/api/analytics/arr/route.ts"
  "app/api/analytics/arr/snapshot/route.ts"

  # next config (remotePatterns + NEXT_DISABLE_IMAGE_OPTIMIZATION support)
  "next.config.js"
)

resolve_conflicts() {
  echo "Resolving conflicts using policy…"
  # list conflicted files
  mapfile -t CF < <(git diff --name-only --diff-filter=U || true)

  if [[ ${#CF[@]} -eq 0 ]]; then
    echo "No conflicts to resolve."
    return 0
  fi

  for f in "${CF[@]}"; do
    # Prefer "theirs" for known high-signal files
    for keep in "${PREFER_THEIRS[@]}"; do
      if [[ "$f" == "$keep" ]]; then
        echo "  -> preferring THEIRS for $f"
        git checkout --theirs -- "$f" || true
        git add "$f"
        continue 2
      fi
    done

    # For package files: prefer theirs then re-install later
    if [[ "$f" == "package.json" || "$f" == "package-lock.json" || "$f" == "pnpm-lock.yaml" ]]; then
      echo "  -> preferring THEIRS for $f (lockfiles will be refreshed)"
      git checkout --theirs -- "$f" || true
      git add "$f"
      continue
    fi

    # Default strategy: prefer ours for unknown conflicts (safer)
    echo "  -> defaulting to OURS for $f"
    git checkout --ours -- "$f" || true
    git add "$f"
  done

  # finalize conflict resolution
  git status --porcelain | grep -q "^UU " && { echo "Unresolved conflicts remain"; exit 1; }
  git commit -m "chore: auto-resolve conflicts per policy"
}

merge_branch() {
  local BR="$1"
  echo ""
  echo "---- Merging $BR ----"
  if ! git ls-remote --exit-code --heads origin "$BR" >/dev/null 2>&1; then
    echo "  (skip) Branch not found on origin: $BR"
    return 0
  fi
  git fetch origin "$BR":"refs/remotes/origin/$BR" || true

  set +e
  git merge --no-ff "origin/$BR" -m "merge: $BR into $REL_BRANCH"
  MERGE_RC=$?
  set -e

  if [[ $MERGE_RC -ne 0 ]]; then
    echo "  Merge reported conflicts; applying policy…"
    resolve_conflicts
  else
    echo "  Merge clean."
  fi
}

for BR in "${MERGE_ORDER[@]}"; do
  merge_branch "$BR"
done

# -----------------------------
# 3) install / build sanity
# -----------------------------
echo ""
echo "Installing deps (clean)…"
if command -v pnpm >/dev/null 2>&1; then
  pnpm install --frozen-lockfile || pnpm install
elif command -v yarn >/dev/null 2>&1; then
  yarn install --frozen-lockfile || yarn install
else
  npm ci || npm install
fi

echo "Running typecheck/build…"
if npm run -s typecheck >/dev/null 2>&1; then
  npm run typecheck || true
fi
npm run build

# -----------------------------
# 4) commit, push, PR URL
# -----------------------------
echo ""
git add -A
if ! git diff --cached --quiet; then
  git commit -m "chore: release merge for launch-platform-92725"
fi
git push -u origin "$REL_BRANCH"

REPO_URL="$(git config --get remote.origin.url | sed -E 's#(git@|https://)github.com[:/](.*)\.git#https://github.com/\2#g')"
echo ""
echo "== ✅ Done. Open PR =="
echo "$REPO_URL/compare/master...$REL_BRANCH?expand=1"
echo ""
echo "Post-merge checklist:"
echo "  1) Merge PR into master to trigger Railway."
echo "  2) If deploy logs show image cache EACCES, set NEXT_DISABLE_IMAGE_OPTIMIZATION=1 in Railway and redeploy."
echo "  3) Hit /api/env-check on prod — all Stripe/Supabase keys should say PRESENT."
echo "  4) Test: /auth (magic link + password), /sports (Stripe buttons), /agents (images + orbit if HP_GUIDE_STAR=1)."
