#!/bin/bash
set -e

echo "Starting deployment process..."

# Get current branch name
BR=$(git rev-parse --abbrev-ref HEAD)
echo "Current branch: $BR"

# Add and commit changes
git add -A
git commit -m "feat(sports): unified hero + mobile polish; hooks fixes; build-safe" || echo "No changes to commit"

# Push working branch
git push -u origin "$BR" || echo "Failed to push branch"

# Switch to master and merge
git checkout master
git pull --ff-only origin master || true

# Try fast-forward merge
if git merge --ff-only "$BR"; then
    echo "Fast-forward merge successful"
    git push origin master
    echo "Deployment triggered on Railway!"
else
    echo "Fast-forward merge failed, may need PR workflow"
fi

# Verification
echo "Last 5 commits on master:"
git log --oneline -n 5

# CI post-deploy smoke (non-blocking)
BASE_URL="${SITE_BASE_URL:-https://skrblai.io}"
echo "Smoke: $BASE_URL"
curl -Isf "$BASE_URL/" | head -n1 || echo "warn: / failed"
curl -s "$BASE_URL/api/health" || echo "warn: /api/health failed"

echo "Deployment process completed!"